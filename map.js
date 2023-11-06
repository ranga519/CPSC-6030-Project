d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(
    function(dataset){
        d3.json("ne_50m_admin_0_countries.geojson").then(
            function(mapbook){
                console.log(dataset)
                console.log(mapbook)

                var countryPop = {}
                var disNum = {}

                
                

                // dataset.forEach( d => {
                //     countryPop[d["ISO"]] = +d["No Affected"]
                // })
                // Replace the code that counts the population with the code to count occurrences
                var isoCount = d3.group(dataset, d => d.ISO);

                isoCount.forEach((count, iso) => {
                    countryPop[iso] = count.length;
                });

                console.log(countryPop)
                console.log(countryPop["BGD"])
                
                var dimensions = {
                    width : 800,
                    height: 400,
                    margin : {
                        top: 10,
                        bottom: 50,
                        left: 60,
                        right: 30
                    }
                }

                var svg1 = d3.select("#map")
                            .attr("width",dimensions.width)
                            .attr("height",dimensions.height)
                
                var projection = d3.geoEqualEarth() //georOrthographic, geoMercator
                                   .fitWidth(dimensions.width, {type: "Sphere"})
                
                var pathGenerator = d3.geoPath(projection)
                //blue sphere of earth
                var earth = svg1.append("path")
                               .attr("d",pathGenerator({type: "Sphere"}))
                               .attr("fill","lightblue")
                
                //grids over Earth
                // var graticule = svg.append("path")
                //                    .attr("d",pathGenerator(d3.geoGraticule10()))
                //                    .attr("stroke","gray")
                //                    .attr("fill","none")
               
                var colorScale = d3.scaleLinear()
                                   .domain([0,d3.max(Object.values(countryPop))])
                                   .range(["white","blue"])

                var countries = svg1.append("g")
                                   .selectAll(".country")
                                   .data(mapbook.features)
                                   .enter()
                                   .append("path")
                                   .attr("class","country")
                                   .attr("d", d => pathGenerator(d))
                                   .attr("fill", d=> colorScale(countryPop[d.properties.ADM0_A3]))




            }
        )
        })
    
