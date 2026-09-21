#!/usr/bin/env python3
"""Rebuild Rydelic Park in Blender 4.x from occupy-map.json + LOCK meters.

1 unit = 1 m.
Park X -> Blender X
Park Z -> Blender Y
height -> Blender Z

No water. Does not import the live walk engine.

Run:
  blender --background --python blender/rydelic_park.py
"""

from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
MAP_PATH = ROOT / "park" / "occupy-map.json"

# LOCK meters copied from park/lock.js (read-only source). Do not invent water.
LOCK = {
    "A": 380,
    "B": 230,
    "capR": 230,
    "straight": 300,
    "hubInner": 18,
    "hubOuter": 32,
    "spineWidth": 14,
    "origin": {"x": 0, "z": 0},
    "gate": {"x": 0, "z": 230},
    "canopies": {
        "The Block": {"cx": -165, "cz": -10, "rx": 130, "rz": 160},
        "After Hours": {"cx": 10, "cz": -140, "rx": 150, "rz": 70},
        "The Board": {"cx": 160, "cz": 10, "rx": 130, "rz": 130},
        "The Pocket": {"cx": 80, "cz": 105, "rx": 95, "rz": 80},
    },
}

# Axis-aligned T-drives from park/roads.js (read-only).
LAND_DRIVES = [
    {"id": "block-drive", "land": "The Block", "pts": [(-36.5, 0), (-100, 0), (-165, 0)]},
    {"id": "board-drive", "land": "The Board", "pts": [(36.5, 0), (100, 0), (160, 0)]},
    {"id": "hours-drive", "land": "After Hours", "pts": [(-18, -36), (-18, -90), (-18, -140)]},
    {"id": "pocket-drive", "land": "The Pocket", "pts": [(18, 36), (60, 36), (60, 80)]},
]
ROAD_W = 9
GRID_MINOR = 25
GRID_MAJOR = 100

COL_GROUND = "park_ground"
COL_ROADS = "park_roads"
COL_MASS = "park_mass"
COL_CANOPY = "park_canopy"
COL_GRID = "park_grid"

# RGB 0-1
GRASS = (0.31, 0.48, 0.24)
CANOPY_COL = {
    "The Block": (0.24, 0.42, 0.28),
    "After Hours": (0.27, 0.41, 0.28),
    "The Board": (0.35, 0.49, 0.26),
    "The Pocket": (0.33, 0.50, 0.32),
}
ASPHALT = (0.24, 0.24, 0.26)
CONCRETE = (0.72, 0.70, 0.66)
MASS_COL = (0.42, 0.32, 0.24)
TREE_TRUNK = (0.35, 0.24, 0.16)
TREE_LEAF = (0.17, 0.35, 0.17)
GRID_MINOR_C = (0.85, 0.85, 0.80)
GRID_MAJOR_C = (0.95, 0.90, 0.55)


def park_to_blender(x, z, y=0.0):
    """Park (x, z, y-up) -> Blender (X, Y, Z-up)."""
    return (float(x), float(z), float(y))


def load_map():
    with MAP_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def lot_counts(lots):
    kinds = Counter(l.get("kind") or "unknown" for l in lots)
    layers = Counter(l.get("layer") or "unknown" for l in lots)
    mass = sum(1 for l in lots if l.get("layer") == "mass")
    return kinds, layers, mass


def print_counts(data):
    lots = data.get("lots") or []
    kinds, layers, mass = lot_counts(lots)
    print("Rydelic Park — Blender rebuild")
    print("map", MAP_PATH)
    print("lots", len(lots), "declared", data.get("count"))
    print("kinds", dict(kinds))
    print("layers", dict(layers))
    print("mass boxes", mass)
    print("trees (instances)", kinds.get("tree", 0))
    print("roads", kinds.get("road", 0), "plates", kinds.get("plate", 0), "spine", kinds.get("spine", 0))
    print("LOCK lawn + 4 canopies + hub r18/r32 + spine 14 m + 4 T-drives + grid 25/100")
    print("NO water")
    return lots, kinds


# --- Blender build (only when bpy is present) ---------------------------------

def _mat(name, color, roughness=0.85):
    import bpy

    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
    mat.diffuse_color = (*color, 1.0)
    return mat


def _link(obj, col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)


def _wipe_park_collections():
    import bpy

    names = (COL_GROUND, COL_ROADS, COL_MASS, COL_CANOPY, COL_GRID)
    for name in names:
        col = bpy.data.collections.get(name)
        if not col:
            continue
        for obj in list(col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(col)
    scene = bpy.context.scene
    cols = {}
    for name in names:
        col = bpy.data.collections.new(name)
        scene.collection.children.link(col)
        cols[name] = col
    for obj in list(scene.collection.objects):
        if obj.name in ("Cube", "Camera", "Light") or obj.type == "MESH" and obj.name.startswith("Cube"):
            if obj.name == "Cube":
                bpy.data.objects.remove(obj, do_unlink=True)
    return cols


def _mesh_object(name, verts, faces, col, mat):
    import bpy

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    _link(obj, col)
    if mat:
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
    return obj


def _box(name, x, z, w, d, h, y0, col, mat):
    """Park-centered box. w east-west, d north-south, h up."""
    hx, hz, hh = w / 2.0, d / 2.0, h / 2.0
    y_mid = y0 + hh
    cx, cy, cz = park_to_blender(x, z, y_mid)
    verts = [
        (cx - hx, cy - hz, cz - hh),
        (cx + hx, cy - hz, cz - hh),
        (cx + hx, cy + hz, cz - hh),
        (cx - hx, cy + hz, cz - hh),
        (cx - hx, cy - hz, cz + hh),
        (cx + hx, cy - hz, cz + hh),
        (cx + hx, cy + hz, cz + hh),
        (cx - hx, cy + hz, cz + hh),
    ]
    faces = [
        (0, 1, 2, 3),
        (4, 7, 6, 5),
        (0, 4, 5, 1),
        (1, 5, 6, 2),
        (2, 6, 7, 3),
        (3, 7, 4, 0),
    ]
    return _mesh_object(name, verts, faces, col, mat)


def _ngon_xy(name, loop_xz, z_up, col, mat):
    verts = [park_to_blender(x, z, z_up) for x, z in loop_xz]
    faces = [tuple(range(len(verts)))]
    return _mesh_object(name, verts, faces, col, mat)


def stadium_outline(n_arc=48):
    s = LOCK["A"] - LOCK["capR"]
    b = LOCK["B"]
    r = LOCK["capR"]
    pts = [(-s, -b), (s, -b)]
    for i in range(1, n_arc):
        a = -math.pi / 2 + math.pi * i / n_arc
        pts.append((s + r * math.cos(a), r * math.sin(a)))
    pts.append((s, b))
    pts.append((-s, b))
    for i in range(1, n_arc):
        a = math.pi / 2 + math.pi * i / n_arc
        pts.append((-s + r * math.cos(a), r * math.sin(a)))
    return pts


def ellipse_outline(cx, cz, rx, rz, n=64):
    return [
        (cx + rx * math.cos(2 * math.pi * i / n), cz + rz * math.sin(2 * math.pi * i / n))
        for i in range(n)
    ]


def circle_outline(cx, cz, r, n=64):
    return ellipse_outline(cx, cz, r, r, n)


def ring_mesh(name, cx, cz, r0, r1, z_up, col, mat, n=72):
    inner = circle_outline(cx, cz, r0, n)
    outer = circle_outline(cx, cz, r1, n)
    verts = [park_to_blender(x, z, z_up) for x, z in outer] + [
        park_to_blender(x, z, z_up) for x, z in inner
    ]
    faces = []
    for i in range(n):
        i1 = (i + 1) % n
        faces.append((i, i1, n + i1, n + i))
    return _mesh_object(name, verts, faces, col, mat)


def polyline_boxes(name_prefix, pts, width, h, y0, col, mat):
    objs = []
    for i in range(len(pts) - 1):
        x0, z0 = pts[i]
        x1, z1 = pts[i + 1]
        mx, mz = (x0 + x1) / 2.0, (z0 + z1) / 2.0
        axis_x = abs(x1 - x0) < 0.05
        w = width if axis_x else abs(x1 - x0)
        d = abs(z1 - z0) if axis_x else width
        if w < 0.05:
            w = width
        if d < 0.05:
            d = width
        objs.append(_box("%s-%d" % (name_prefix, i), mx, mz, w, d, h, y0, col, mat))
    return objs


def make_tree_proto(col, trunk_mat, leaf_mat):
    """Unit tree mesh (trunk + crown). Instances share this mesh."""
    t_verts = [
        (-0.12, -0.12, 0.0),
        (0.12, -0.12, 0.0),
        (0.12, 0.12, 0.0),
        (-0.12, 0.12, 0.0),
        (-0.08, -0.08, 1.6),
        (0.08, -0.08, 1.6),
        (0.08, 0.08, 1.6),
        (-0.08, 0.08, 1.6),
        (0.0, 0.0, 2.8),
        (0.7, 0.0, 2.1),
        (0.0, 0.7, 2.1),
        (-0.7, 0.0, 2.1),
        (0.0, -0.7, 2.1),
        (0.0, 0.0, 1.5),
    ]
    t_faces = [
        (0, 1, 2, 3),
        (4, 7, 6, 5),
        (0, 4, 5, 1),
        (1, 5, 6, 2),
        (2, 6, 7, 3),
        (3, 7, 4, 0),
        (8, 9, 10),
        (8, 10, 11),
        (8, 11, 12),
        (8, 12, 9),
        (13, 10, 9),
        (13, 11, 10),
        (13, 12, 11),
        (13, 9, 12),
    ]
    proto = _mesh_object("_tree_proto", t_verts, t_faces, col, leaf_mat)
    if proto.data.materials:
        proto.data.materials.append(trunk_mat)
    proto.hide_set(True)
    proto.hide_render = True
    return proto


def instance_tree(proto, lot, col):
    inst = proto.copy()
    inst.data = proto.data
    inst.name = str(lot.get("id") or "tree")
    r = max(1.2, float(lot.get("w") or 4) / 2.0)
    scale = r / 0.7
    inst.scale = (scale, scale, max(0.8, float(lot.get("h") or 8) / 2.8))
    inst.location = park_to_blender(lot["x"], lot["z"], lot.get("y0") or 0)
    inst.hide_set(False)
    inst.hide_render = False
    _link(inst, col)
    return inst


def build_grid(col, mat_minor, mat_major):
    a, b = LOCK["A"], LOCK["B"]
    objs = 0
    x = -a
    while x <= a + 0.01:
        major = abs(x) % GRID_MAJOR < 0.01 or abs(abs(x) % GRID_MAJOR - GRID_MAJOR) < 0.01
        h = 0.04 if major else 0.02
        _box(
            "grid-x-%d" % int(x),
            x,
            0,
            0.12 if major else 0.06,
            b * 2,
            h,
            0.01,
            col,
            mat_major if major else mat_minor,
        )
        objs += 1
        x += GRID_MINOR
    z = -b
    while z <= b + 0.01:
        major = abs(z) % GRID_MAJOR < 0.01 or abs(abs(z) % GRID_MAJOR - GRID_MAJOR) < 0.01
        h = 0.04 if major else 0.02
        _box(
            "grid-z-%d" % int(z),
            0,
            z,
            a * 2,
            0.12 if major else 0.06,
            h,
            0.01,
            col,
            mat_major if major else mat_minor,
        )
        objs += 1
        z += GRID_MINOR
    return objs


def build_scene(lots):
    import bpy

    cols = _wipe_park_collections()
    mat_grass = _mat("park_grass", GRASS)
    mat_asphalt = _mat("park_asphalt", ASPHALT, 0.7)
    mat_conc = _mat("park_concrete", CONCRETE, 0.6)
    mat_mass = _mat("park_mass", MASS_COL, 0.75)
    mat_trunk = _mat("park_trunk", TREE_TRUNK, 0.9)
    mat_leaf = _mat("park_leaf", TREE_LEAF, 0.8)
    mat_grid_m = _mat("park_grid_minor", GRID_MINOR_C, 1.0)
    mat_grid_M = _mat("park_grid_major", GRID_MAJOR_C, 1.0)
    mat_plate = _mat("park_plate", (0.34, 0.50, 0.28))

    _ngon_xy("lawn-stadium", stadium_outline(), 0.0, cols[COL_GROUND], mat_grass)

    for name, c in LOCK["canopies"].items():
        loop = ellipse_outline(c["cx"], c["cz"], c["rx"], c["rz"])
        colr = CANOPY_COL.get(name, GRASS)
        mat = _mat("canopy-" + name.replace(" ", "_"), colr)
        _ngon_xy("canopy-" + name.replace(" ", "_"), loop, 0.03, cols[COL_GROUND], mat)

    _ngon_xy("hub-inner-r18", circle_outline(0, 0, LOCK["hubInner"]), 0.08, cols[COL_GROUND], mat_conc)
    ring_mesh("hub-outer-r32", 0, 0, LOCK["hubInner"], LOCK["hubOuter"], 0.12, cols[COL_GROUND], mat_conc)

    _box("spine-14-lock", 0, 0, LOCK["spineWidth"], LOCK["B"] * 2, 0.4, 0.0, cols[COL_ROADS], mat_asphalt)
    ring_mesh(
        "hub-ring-road",
        0,
        0,
        LOCK["hubOuter"],
        LOCK["hubOuter"] + ROAD_W,
        0.14,
        cols[COL_ROADS],
        mat_asphalt,
        96,
    )
    for d in LAND_DRIVES:
        polyline_boxes(d["id"], d["pts"], ROAD_W, 0.28, 0.0, cols[COL_ROADS], mat_asphalt)

    n_grid = build_grid(cols[COL_GRID], mat_grid_m, mat_grid_M)

    proto = make_tree_proto(cols[COL_CANOPY], mat_trunk, mat_leaf)
    built = Counter()
    for lot in lots:
        kind = lot.get("kind") or "prop"
        lid = str(lot.get("id") or kind)
        x, z = float(lot["x"]), float(lot["z"])
        w = float(lot.get("w") or 2)
        d = float(lot.get("d") or 2)
        h = float(lot.get("h") or 1)
        y0 = float(lot.get("y0") or 0)
        if kind == "tree":
            instance_tree(proto, lot, cols[COL_CANOPY])
        elif kind in ("building", "gate", "station") or lot.get("layer") == "mass":
            _box(lid, x, z, w, d, max(h, 1.0), y0, cols[COL_MASS], mat_mass)
        elif kind in ("road", "spine"):
            _box(lid, x, z, w, d, max(h, 0.08), y0, cols[COL_ROADS], mat_asphalt)
        elif kind == "plate":
            _box(lid, x, z, w, d, max(h, 0.02), y0, cols[COL_GROUND], mat_plate)
        else:
            _box(lid, x, z, w, d, max(h, 0.2), y0, cols[COL_GROUND], mat_plate)
        built[kind] += 1

    print("built lots", dict(built), "grid lines", n_grid)
    print("collections", ", ".join(sorted(cols)))


def main():
    if not MAP_PATH.is_file():
        raise SystemExit("missing occupy map: %s" % MAP_PATH)
    data = load_map()
    lots, kinds = print_counts(data)
    try:
        import bpy  # noqa: F401
    except ImportError:
        print("bpy not present — counts only (open this file in Blender 4.x to mesh)")
        return
    build_scene(lots)


if __name__ == "__main__":
    main()
