d3.dijkstra = function() {
  var dijkstra = {},
    nodes, edges, source, dispatch = d3.dispatch("start", "tick", "step", "end");
  var start, end, graphtool
  var n_limit = 1
  var tick_count = 0

  dijkstra.run = function(src) {

    if (start != undefined) {
      src = start
    }
    if (src != undefined) {
      // console.log('src')
      // console.log(src)
      // console.log('start')
      // console.log(start)
      // console.log('end')
      // console.log(end)
      source = src;
      var unvisited = [];
      nodes.forEach(function(d) {
        if (d.name != src.IATA) {
          d.distance = Infinity;
          unvisited.push(d);
          d.visited = false;
        }
      });
      // console.log(nodes)

      var current = src;
      current.distance = 0;

      // var stop_weight = 20
      function tick() {
        // console.log(current.IATA)
        if(tick_count < 1000){
          current.visited = true;
          if (current.links != undefined) {
            current.links.forEach(function(link) {
              var tar = link.target;
              if (!tar.visited) {
                var dist = current.distance + link.value;
                tar.distance = Math.min(dist, tar.distance);
                if (tar.from == undefined) {
                  tar.from = {}
                }
                tar.from[current.IATA] = dist
              }
            });
          }

          if (unvisited.length == 0 || current.distance == Infinity) {
            var nodes_by_iata = {}
            nodes.forEach(function(node) {
              nodes_by_iata[node.IATA] = node
            })
            var count = 0
            if(end!=undefined){
              // var route
              var route = []
              var route_current = end
              // console.log('* starting all')
              function routefrom(route_current, route){
                // console.log('** route_current', route_current)

                var route = Object.create(route)
                if(route_current.IATA.indexOf(start.IATA) != 0){

                  route.unshift(route_current)
                  if(route_current.from!=undefined){
                    var froms = route_current.from
                    var from_array = []
                    var min_from = 9999999
                    var temp

                    Object.keys(froms).forEach(function(key){
                      from_array.push({'iata': key, 'value': froms[key]})
                    })

                    // console.log(' ++ from_array', from_array)

                    froms = from_array
                    for(a=0;a < froms.length;a++){
                      for(b=a+1;b < froms.length;b++){
                        // console.log(' +++ froms', froms)
                        if(froms[b].value < froms[a].value){
                          temp = froms[a]
                          froms[a] = froms[b]
                          froms[b] = froms [a]
                        }
                      }
                    }
                    // console.log('**** froms',JSON.stringify(froms))

                    froms.forEach(function(each_from){
                      if(tick_count < 100){
                        routefrom(nodes_by_iata[each_from['iata']], route)
                        tick_count ++
                      }
                    })
                  }
                } else {
                  // console.log('***** adding last (finishing route)', route_current)

                  route.unshift(route_current)
                  if(count == n_limit-1){
                    graphtool(route)
                  }
                  count ++
                  
                }
              }

              routefrom(route_current, [])


              // route_current.from.forEach(function(each_from){
              //   console.log('each_from')
              //   console.log(each_from)
              // })

              // route.unshift(end)
              // route.unshift(start)
            }

            dispatch.end()
            return true;
          }
          unvisited.sort(function(a, b) {
            return b.distance - a.distance
          });

          current = unvisited.pop()

          dispatch.tick();

          return false;
        }

      }

      d3.timer(tick);
    }

  };

  dijkstra.nodes = function(_) {
    if (!arguments.length)
      return nodes;
    else {
      nodes = Object.create(_);
      return dijkstra;
    }
  };

  dijkstra.edges = function(_) {
    if (!arguments.length)
      return edges;
    else {
      edges = _;
      return dijkstra;
    }
  };

  dijkstra.pointa = function(_) {
    if (!arguments.length)
      return start;
    else {
      start = _;
      return dijkstra;
    }
  };
  dijkstra.pointb = function(_) {
    if (!arguments.length)
      return end;
    else {
      end = _;
      return dijkstra;
    }
  };
  dijkstra.graph = function(_) {
    if (!arguments.length)
      return graphtool;
    else {
      graphtool = _;
      return dijkstra;
    }
  };
  dijkstra.limit = function(_) {
    if (!arguments.length)
      return n_limit;
    else {
      n_limit = _;
      return dijkstra;
    }
  };

  dijkstra.source = function(_) {
    if (!arguments.length)
      return source;
    else {
      source = _;
      return dijkstra;
    }
  };


  dispatch.on("start.code", dijkstra.run);

  return d3.rebind(dijkstra, dispatch, "on", "end", "start", "tick");
};
