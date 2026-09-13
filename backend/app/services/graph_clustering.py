"""
Graph-Theoretic Community Clustering Engine
===========================================
Replaces single-pass greedy sequential matching with global graph optimization.
Constructs an undirected graph of validated material compatibility, applies
community detection, and designates the cluster Medoid as the National Canonical Anchor.
"""

import uuid
from typing import List, Dict, Any, Optional
import networkx as nx

class _cluster_method:
    def __init__(self, fn):
        self.fn = fn
    def __get__(self, instance, owner):
        if instance is not None:
            return lambda *args, **kwargs: self.fn(instance, *args, **kwargs)
        return lambda *args, **kwargs: self.fn(owner, *args, **kwargs)

class GraphClusteringService:
    """Graph Community Clustering and Medoid Centrality Engine."""

    def __init__(self, min_similarity_threshold: float = 0.65, include_singletons: bool = True):
        self.min_similarity_threshold = min_similarity_threshold
        self.include_singletons = include_singletons

    @_cluster_method
    def cluster_materials(
        self_or_cls,
        materials: List[Dict[str, Any]],
        pairwise_matches: List[Dict[str, Any]],
        threshold: Optional[float] = None,
        include_singletons: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Partitions materials into globally consistent equivalence groups using NetworkX graph theory.
        Guarantees order-independent clustering and selects the Medoid Centrality anchor.
        """
        if not materials:
            return []

        if threshold is None:
            threshold = getattr(self_or_cls, "min_similarity_threshold", 0.65)

        if include_singletons is None:
            include_singletons = getattr(self_or_cls, "include_singletons", False)

        # 1. Initialize undirected graph with all material nodes
        G = nx.Graph()
        mat_by_id = {m["id"]: dict(m) for m in materials}
        for m in materials:
            G.add_node(m["id"], data=m)

        # 2. Add edges only for validated, non-conflicting compatible pairs
        for match in pairwise_matches:
            id_a = match.get("id_a") or match.get("source_id")
            id_b = match.get("id_b") or match.get("target_id")
            score = match.get("confidence_score") if "confidence_score" in match else match.get("weight", 0.0)
            has_conflict = match.get("has_critical_conflict", False)

            if id_a and id_b and not has_conflict and score >= threshold:
                if G.has_node(id_a) and G.has_node(id_b):
                    G.add_edge(id_a, id_b, weight=score, match_data=match)

        # 3. Detect communities using Connected Components
        connected_subgraphs = [G.subgraph(c).copy() for c in nx.connected_components(G)]

        equivalence_clusters: List[Dict[str, Any]] = []

        for sub_g in connected_subgraphs:
            nodes = list(sub_g.nodes())
            if not nodes:
                continue
            if len(nodes) < 2 and not include_singletons:
                continue

            # 4. Calculate Medoid Centrality (node with highest degree / weighted closeness)
            if len(nodes) == 1:
                sorted_nodes = [nodes[0]]
            elif len(nodes) == 2:
                # In 2-node cluster, both have identical degree, pick the one with richer description
                n1, n2 = nodes[0], nodes[1]
                len1 = len(mat_by_id[n1].get("source_description", ""))
                len2 = len(mat_by_id[n2].get("source_description", ""))
                sorted_nodes = [n1, n2] if len1 >= len2 else [n2, n1]
            else:
                centralities = nx.degree_centrality(sub_g)
                sorted_nodes = sorted(nodes, key=lambda n: (centralities[n], len(mat_by_id[n].get("source_description", ""))), reverse=True)

            anchor_id = sorted_nodes[0]
            anchor_data = dict(mat_by_id[anchor_id])
            anchor_data["is_anchor"] = True

            # Calculate cluster cohesion metrics
            edge_weights = [d["weight"] for _, _, d in sub_g.edges(data=True)]
            max_score = max(edge_weights) if edge_weights else (1.0 if len(nodes) == 1 else 0.85)
            avg_score = sum(edge_weights) / len(edge_weights) if edge_weights else max_score

            all_conflicts = []
            all_matches = []
            for _, _, d in sub_g.edges(data=True):
                m_data = d.get("match_data", {})
                all_conflicts.extend(m_data.get("conflicts", []))
                all_matches.extend(m_data.get("matches", []))

            # Determine aggregate relationship type
            if len(nodes) == 1:
                rel_type = "ISOLATED"
            elif avg_score >= 0.85:
                cpses = {mat_by_id[n].get("cpse_id") for n in sorted_nodes}
                rel_type = "DUPLICATE" if len(cpses) == 1 else "IDENTICAL"
            elif avg_score >= 0.65:
                rel_type = "NEAR_DUPLICATE"
            else:
                rel_type = "RELATED"

            cluster_members = []
            for n in sorted_nodes:
                m_copy = dict(mat_by_id[n])
                m_copy["is_anchor"] = (n == anchor_id)
                cluster_members.append(m_copy)

            equivalence_clusters.append({
                "cluster_id": str(uuid.uuid4()),
                "anchor": anchor_data,
                "anchor_id": anchor_id,
                "members": cluster_members,
                "member_ids": sorted_nodes,
                "size": len(sorted_nodes),
                "highest_score": round(max_score, 4),
                "average_cohesion": round(avg_score, 4),
                "relationship_type": rel_type,
                "agreed_attributes": list(dict.fromkeys(all_matches)),
                "conflicts": list(dict.fromkeys(all_conflicts))
            })

        return equivalence_clusters
