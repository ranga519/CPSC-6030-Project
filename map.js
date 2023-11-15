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
                        left: 30,
                        right: 30
                    }
                }

                var svg1 = d3.select("svg")
                            .attr("width",dimensions.width)
                            .attr("height",dimensions.height)
                
                var projection = d3.geoMercator() //georOrthographic, geoMercator, geoEqualEarth()
                                   .fitWidth(dimensions.width, {type: "Sphere"})
                                   .center([0, 20]) // Adjust the longitude and latitude to change the center
                                   .scale(110) // Adjust the scale for zooming
                                   .translate([dimensions.width / 2 - dimensions.margin.left, dimensions.height / 2]);
                
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
                                   .range(["white","#263f91"])

                // var countries = svg1.append("g")
                //                    .selectAll(".country")
                //                    .data(mapbook.features)
                //                    .enter()
                //                    .append("path")
                //                    .attr("class","country")
                //                    .attr("d", d => pathGenerator(d))
                //                    .attr("fill", d=> colorScale(countryPop[d.properties.ADM0_A3]))
                //                 //    .attr("stroke", "black") // Sets the border color
                //                 //    .attr("stroke-width", 0.5); // Sets the border width
                
                var maptextbox = d3.select("body").append("div")
                                .attr("class", "maptextbox")
                                .style("opacity", 0)
                                .style("position", "absolute")
                                .style("padding", "10px")
                                .style("background", "lightgrey")
                                .style("border", "solid")
                                .style("border-width", "1px")
                                .style("border-radius", "5px")
                                .style("pointer-events", "none");
                            
                var countries = svg1.append("g")
                                .selectAll(".country")
                                .data(mapbook.features)
                                .enter()
                                .append("path")
                                .attr("class", "country")
                                .attr("d", d => pathGenerator(d))
                                .attr("fill", d => colorScale(countryPop[d.properties.ADM0_A3]))
                                .attr("stroke", "gray")
                                .attr("stroke-width", 0.25)
                                .on("mouseover", function(event, d) {
                                    d3.select(this)
                                        .attr("stroke", "black")
                                        .attr("stroke-width", 1.5);
                            
                                    maptextbox.transition()
                                        .duration(200)
                                        .style("opacity", .9);
                                    maptextbox.html(d.properties.ADMIN + ": " + (countryPop[d.properties.ADM0_A3] || 0) + " disasters")
                                        .style("left", (event.pageX) + "px")
                                        .style("top", (event.pageY - 28) + "px");
                                })
                                .on("mouseout", function(d) {
                                    d3.select(this)
                                        .attr("stroke", "gray")
                                        .attr("stroke-width", 0.5);
                            
                                    maptextbox.transition()
                                        .duration(500)
                                        .style("opacity", 0);
                                });
                            




            }
        )
        })
    
