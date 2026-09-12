"""
National Unified Material Master (NUMM) · Graph Clustering Service
Implements graph-based community detection with medoid centrality anchor selection.
Replaces greedy single-pass sequential matching with topological community partitioning.
"""

from typing import List, Dict, Any, Optional, Set, Tuple
from collections import defaultdict
import math

class GraphClusteringService:
    def __init__(self, min_similarity_threshold: float = 0.60):
        self.min_similarity_threshold = min_similarity_threshold

    def build_graph(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]]
    ) -> Tuple[Dict[str, Set[str]], Dict[Tuple[str, str], float]]:
        """
        Builds adjacency list and edge weight map.
        Edges with has_critical_conflict=True or weight < threshold are filtered out.
        """
        adjacency: Dict[str, Set[str]] = defaultdict(set)
        weights: Dict[Tuple[str, str], float] = {}

        # Ensure all nodes exist in adjacency even if isolated
        for n in nodes:
            nid = str(n.get("id") or n.get("material_id") or n.get("code") or id(n))
            adjacency[nid] = set()

        for edge in edges:
            source = str(edge.get("source_id") or edge.get("item1_id"))
            target = str(edge.get("target_id") or edge.get("item2_id"))
            weight = float(edge.get("weight") or edge.get("similarity") or edge.get("score") or 0.0)
            conflict = bool(edge.get("has_critical_conflict", False))

            # Strictly enforce zero tolerance on physical contradictions
            if conflict or weight < self.min_similarity_threshold:
                continue

            if source != target:
                adjacency[source].add(target)
                adjacency[target].add(source)
                weights[(source, target)] = weight
                weights[(target, source)] = weight

        return adjacency, weights

    def detect_communities(
        self,
        adjacency: Dict[str, Set[str]]
    ) -> List[List[str]]:
        """
        Finds connected components / graph clusters using BFS/DFS.
        Ensures deterministic order.
        """
        visited: Set[str] = set()
        communities: List[List[str]] = []

        all_nodes = sorted(list(adjacency.keys()))
        for node in all_nodes:
            if node not in visited:
                cluster: List[str] = []
                queue = [node]
                visited.add(node)

                while queue:
                    curr = queue.pop(0)
                    cluster.append(curr)
                    for neighbor in sorted(list(adjacency[curr])):
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)

                communities.append(cluster)

        return communities

    def calculate_medoid(
        self,
        cluster: List[str],
        weights: Dict[Tuple[str, str], float]
    ) -> Tuple[str, float]:
        """
        Calculates medoid centrality:
        Medoid = argmax_{u in C} sum_{v in C} W(u, v)
        Returns (medoid_id, average_cohesion).
        """
        if not cluster:
            return "", 0.0
        if len(cluster) == 1:
            return cluster[0], 1.0

        best_node = cluster[0]
        max_centrality = -1.0
        total_cluster_weight = 0.0
        possible_pairs = len(cluster) * (len(cluster) - 1) / 2.0

        centralities: Dict[str, float] = {}

        for u in cluster:
            sum_w = 0.0
            for v in cluster:
                if u == v:
                    sum_w += 1.0
                else:
                    w = weights.get((u, v), 0.0)
                    sum_w += w
            centralities[u] = sum_w
            if sum_w > max_centrality:
                max_centrality = sum_w
                best_node = u

        # Compute cluster cohesion (average edge weight between distinct pairs)
        pair_weights_sum = 0.0
        for i in range(len(cluster)):
            for j in range(i + 1, len(cluster)):
                pair_weights_sum += weights.get((cluster[i], cluster[j]), 0.0)

        cohesion = (pair_weights_sum / possible_pairs) if possible_pairs > 0 else 1.0
        return best_node, round(cohesion, 4)

    def cluster_materials(
        self,
        materials: List[Dict[str, Any]],
        pairwise_edges: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        High-level clustering pipeline:
        1. Build graph with contradiction filtering
        2. Detect graph communities
        3. Identify medoid anchor for each community
        4. Return structured cluster payloads with anchor/member metadata
        """
        mat_map = {
            str(m.get("id") or m.get("material_id") or m.get("code") or id(m)): m
            for m in materials
        }

        adjacency, weights = self.build_graph(materials, pairwise_edges)
        communities = self.detect_communities(adjacency)

        clusters: List[Dict[str, Any]] = []
        for idx, comm in enumerate(communities, start=1):
            medoid_id, cohesion = self.calculate_medoid(comm, weights)
            anchor_mat = mat_map.get(medoid_id, {})

            members = []
            for nid in comm:
                mat = mat_map.get(nid, {})
                sim_to_anchor = 1.0 if nid == medoid_id else weights.get((nid, medoid_id), 0.0)
                members.append({
                    "id": nid,
                    "is_anchor": (nid == medoid_id),
                    "similarity_to_anchor": round(sim_to_anchor, 4),
                    "material_data": mat
                })

            clusters.append({
                "cluster_id": f"CLUST-{idx:04d}",
                "size": len(comm),
                "anchor_id": medoid_id,
                "anchor_item": anchor_mat,
                "cohesion_score": cohesion,
                "members": members
            })

        # Sort clusters by size descending
        clusters.sort(key=lambda c: c["size"], reverse=True)
        return clusters
