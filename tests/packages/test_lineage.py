from lineage_graph import LineageGraph


def test_lineage_graph():
    g = LineageGraph()
    g.add_node('a','dataset','A')
    g.add_node('b','dataset','B')
    g.add_edge('a','b','transform')
    c = g.to_cytoscape()
    assert len(c['nodes']) == 2
    assert c['edges'][0]['data']['source'] == 'a'
