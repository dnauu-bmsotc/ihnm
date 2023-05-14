var app = new Vue({
    el: '#app',

    data: {
        table: [],
        ns: "http://www.w3.org/2000/svg",
        roses: {
            azimuthsStrike: {
                cx: 0,
                cy: -50,
                r: 100,
                svg: null,
            },
            azimuthsDip: {
                cx: 0,
                cy: 0,
                r: 50,
                svg: null,
            },
            incidence: {
                cx: -50,
                cy: -50,
                r: 100,
                svg: null,
            },
        },
    },

    created: function() {
        for (let i = 0; i < 36 * 9; i++) {
            this.table.push({
                value: "0",
                col: i % 9,
                row: Math.floor(i / 9)
            });
        }

        this.roses.incidence.svg = document.getElementById("rose-incidence");
        this.drawSun(this.roses.incidence);

        this.roses.azimuthsStrike.svg = document.getElementById("rose-azimuths-strike");
        this.drawSun(this.roses.azimuthsStrike);

        this.roses.azimuthsDip.svg = document.getElementById("rose-azimuths-dip");
        this.drawSun(this.roses.azimuthsDip);

        this.importFromStorage();
    },

    methods: {
        range: function (n) {
            return [...Array(n).keys()];
        },

        importFromStorage: function() {
            try {
                const item = localStorage.getItem("rose-diagramm-data");

                if (!item) {
                    return new Array(36 * 9).fill(0);
                } 
        
                const data = JSON.parse(item).map(x => parseInt(x));
        
                if (data.length !== 36 * 9) {
                    throw new Error();
                }
        
                for (let i = 0; i < 36 * 9; i++) {
                    this.table[i].value = data[i];
                }
            }
            catch (error) {
                console.log("error loading from localStorage");
            }
        },
        
        exportToStorage: function() {
            localStorage.setItem("rose-diagramm-data", JSON.stringify(this.table.map(cell => +cell.value)));
        },
        
        clearStorage: function() {
            localStorage.removeItem("rose-diagramm-data");
        },

        drawSun: function(rose) {
            const circle = document.createElementNS(this.ns, "circle");
            circle.setAttributeNS(null, "cx", rose.cx);
            circle.setAttributeNS(null, "cy", -rose.cy);
            circle.setAttributeNS(null, "r", rose.r);
            circle.setAttributeNS(null, "fill", "transparent");
            circle.setAttributeNS(null, "stroke", "black");
            circle.setAttributeNS(null, "stroke-width", 0.3);
            rose.svg.appendChild(circle);
        
            for (let i = 5; i < 180; i += 10) {
                const line = document.createElementNS(this.ns, "line");
                line.setAttributeNS(null, "x1", rose.cx + rose.r*Math.cos(i * Math.PI / 180));
                line.setAttributeNS(null, "y1", -rose.cy - rose.r*Math.sin(i * Math.PI / 180));
                line.setAttributeNS(null, "x2", rose.cx + rose.r*Math.cos(i * Math.PI / 180 + Math.PI));
                line.setAttributeNS(null, "y2", -rose.cy - rose.r*Math.sin(i * Math.PI / 180 + Math.PI));
                line.setAttributeNS(null, "stroke", "black");
                line.setAttributeNS(null, "stroke-width", 0.3);
                rose.svg.appendChild(line);
            }
        },
        
        drawComplexRose: function() {
            const radius = 50;
        
            const xarr = [], yarr = [], zarr = [];
        
            this.table.map((z, index) => {
                const angle = 5 + Math.trunc(index / 9) * 10;
                const dist = (index % 9) * radius / 9;
                
                xarr.push(dist * Math.cos(angle * Math.PI / 180 - Math.PI / 2));
                yarr.push(-dist * Math.sin(angle * Math.PI / 180 - Math.PI / 2));
                zarr.push(z.value-1);
            })
        
            var roseData = [{
                z: zarr,
                x: xarr,
                y: yarr,
                type: 'contour',
                contours: {
                    start: 0,
                    end: Math.max.apply(null, this.table.map(cell => cell.value)),
                    size: 1
                },
                colorscale: 'Viridis',
                autocontour: false,
                line: {
                    width: 1,
                    color: "white",
                }
            }];
        
            const shapes= [
                {
                    type: 'circle',
                    xref: 'x',
                    yref: 'y',
                    x0: -radius,
                    y0: -radius,
                    x1: radius,
                    y1: radius,
                    fillcolor: 'transparent',
                    opacity: 0.5,
                    line: {
                        color: 'white',
                        width: 1,
                    }
                },
            ];
        
            for (let i = 5; i < 360; i += 10) {
                shapes.push({
                    type: "line",
                    xref: 'x',
                    yref: 'y',
                    x0: 0,
                    y0: 0,
                    x1: radius * Math.cos(i * Math.PI / 180),
                    y1: radius * Math.sin(i * Math.PI / 180),
                    opacity: 0.5,
                    line: {
                        color: 'white',
                        width: 1,
                    }
                });
            }
        
            var layout = {
                title: 'Комплексная роза-диаграмма',
                width: 600,
                height: 600,
                shapes: shapes,
            }
        
            Plotly.newPlot('rose-complex', roseData, layout);
        },

        onReset: function() {
            for (let cell of this.table) {
                cell.value = 0;
            }
            
            this.clearStorage();
        },
        
        onRandom: function() {
            for (let cell of this.table) {
                cell.value = Math.floor(0 + Math.random()**6 * 20);
            }
            
            this.exportToStorage();
        },
        
        onPreset: function() {
            const data = ["1",0,0,0,0,0,"1",0,0,0,0,"1",0,0,0,0,0,0,0,"1","1",0,0,0,0,0,0,0,"1",
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1",0,0,0,0,0,0,0,0,"2","0","2",0,0,0,0,
            0,0,0,0,"1","2","2",0,0,0,0,0,0,0,0,"1",0,0,0,0,0,0,"2","1",0,0,0,0,"2",0,
            "1",0,"1",0,"2",0,0,0,0,"2","4",0,"1",0,0,"1","1",0,0,"3","1","1",0,0,"1",
            "1","0","1",0,0,0,"1","1",0,"2","1","1","1","1","1","2","2",0,0,"1","1","2",
            0,"2",0,"2",0,0,"1","2",0,0,0,"1",0,0,0,0,0,"1",0,0,0,0,0,0,0,0,0,0,"1",0,
            0,0,0,0,0,0,0,0,"1","1",0,0,0,"1",0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1",0,0,"1",
            0,0,0,"1",0,0,0,"1",0,"1",0,0,0,0,0,0,"2",0,"1",0,0,0,0,0,"1","1",0,0,0,0,
            0,0,0,0,"1",0,"1",0,0,"1",0,0,"1","2","1",0,0,0,"1",0,0,"1","4","3","2","1",
            0,0,0,0,0,0,"4","1","4","2","1","1",0,"1","1","2","3","2","2","2","1",0,"2",
            "2","1","2","1","1",0,0,"1","1","1","2",0,"2","4","2","1","2",0,"1","2","2",
            "3","1","1","3",0,0,0,"1","1","1",0,0,0,0,"1",0,0,0,0,"2",0,"1",0];

            for (let i = 0; i < 36 * 9; i++) {
                this.table[i].value = data[i];
            }

            this.exportToStorage();
        },
    },

    computed: {
        colsSums: function() {
            return this.range(9).map(col => this.table.filter(t => t.col === col)
                .reduce((acc, cel) => acc += +cel.value, 0));
        },

        rowsSums: function() {
            return this.range(36).map(row => this.table.filter(t => t.row === row)
                .reduce((acc, cel) => acc += +cel.value, 0));
        },

        tableSum: function() {
            return this.colsSums.reduce((ss, s) => ss += s, 0);
        },

        azimuthsDipRosePoints: function() {
            const rose = this.roses.azimuthsDip;
            const maxmax = Math.max.apply(null, this.rowsSums);
            let p = "";

            for (let i = 0; i < 36; i++) {
                const dist = rose.r / maxmax * this.rowsSums[i];
                const angle = (5 + i * 360 / 36 - 90) * Math.PI / 180;
                p += dist*Math.cos(angle) + ",";
                p += dist*Math.sin(angle) + " ";
            }
        
            return p;
        },

        azimuthsStrikeRosePoints: function() {
            const rose = this.roses.azimuthsStrike;

            const arr = [];
            for (let i = 0; i < 36 / 2; i++) {
                arr.push(this.rowsSums[i] + this.rowsSums[i + 36/2])
            }
        
            let p = rose.cx + "," + -rose.cy + " ";
            const maxmax = Math.max.apply(null, arr);
            for (let i = 0; i < 36 / 2; i++) {
                const dist = rose.r / maxmax * arr[i];
                const angle = (175 - i * 10) * Math.PI / 180;
                p += rose.cx + dist*Math.cos(angle) + ",";
                p += -rose.cy - dist*Math.sin(angle) + " ";
            }

            return p;
        },

        incidencePoints: function() {
            const rose = this.roses.incidence;
        
            let p = rose.cx + "," + -rose.cy + " ";
            const maxmax = Math.max.apply(null, this.colsSums);
            for (let i = 0; i < 9; i++) {
                const dist = rose.r / maxmax * this.colsSums[i];
                const angle = (5 + i * 90 / 9) * Math.PI / 180;
                p += rose.cx + dist*Math.cos(angle) + ",";
                p += -rose.cy - dist*Math.sin(angle) + " ";
            }
        
            return p;
        }
    },
})