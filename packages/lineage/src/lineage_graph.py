from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Node:
    id: str
    type: str
    label: str


@dataclass
class Edge:
    source: str
    target: str
    label: str


class LineageGraph:
    def __init__(self) -> None:
        self.nodes: dict[str, Node] = {}
        self.edges: list[Edge] = []

    def add_node(self, node_id: str, node_type: str, label: str) -> None:
        self.nodes[node_id] = Node(id=node_id, type=node_type, label=label)

    def add_edge(self, source: str, target: str, label: str) -> None:
        self.edges.append(Edge(source=source, target=target, label=label))

    def to_cytoscape(self) -> dict[str, list[dict[str, dict[str, str]]]]:
        return {
            "nodes": [{"data": {"id": n.id, "label": n.label, "type": n.type}} for n in self.nodes.values()],
            "edges": [{"data": {"source": e.source, "target": e.target, "label": e.label}} for e in self.edges],
        }
