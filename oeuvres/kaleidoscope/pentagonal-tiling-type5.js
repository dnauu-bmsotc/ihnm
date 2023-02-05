"use strict"

function createPentagonalTilingType5(svgcanvas, fill, start, size, count, parameterAngle, parameterSegment) {
    function createPrimitiveCell(center) {
        const cell = document.createElementNS("http://www.w3.org/2000/svg", "g");
        function createSingleTile(center, angle) {
            const tile = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const points = [svgcanvas.createSVGPoint()];
            points[0].x = center.x;
            points[0].y = center.y;
            function addPointOff(distance, angle) {
                const p = svgcanvas.createSVGPoint();
                p.x = points[points.length - 1].x;
                p.y = points[points.length - 1].y;
                p.x += distance * Math.cos(angle / 180 * Math.PI);
                p.y += distance * Math.sin(angle / 180 * Math.PI);
                points.push(p);
            }
            addPointOff(size, angle);
            addPointOff(parameterSegment, angle - (180 - parameterAngle));
            const u = (parameterAngle - 60) * Math.PI / 180;
            const x = Math.sqrt(size**2 + parameterSegment**2 - 2*size*parameterSegment*Math.cos(u));
            const a = Math.asin(size / x * Math.sin(u)) * 180 / Math.PI + 30;
            addPointOff(x / Math.sqrt(3), angle - (180 - parameterAngle) - (180 - a));
            addPointOff(x / Math.sqrt(3), angle - (180 - parameterAngle) - (180 - a) - 60);
            for (let point of points) {
                tile.points.appendItem(point);
            }
            tile.style.fill = fill;
            return tile;
        }
        const base_segment2_opposite_side = Math.sqrt(size**2 + (parameterSegment/2)**2 - 2*size*(parameterSegment/2)*Math.cos(parameterAngle*Math.PI/180));
        const additionalRotation = Math.asin((parameterSegment/2)/base_segment2_opposite_side*Math.sin(parameterAngle*Math.PI/180)) * 180 / Math.PI;
        for (let rotation = 0; rotation < 360; rotation += 60) {
            const tile = createSingleTile({x: 0, y: 0}, 0);
            tile.setAttribute("transform", `translate(${center.x}, ${center.y}) rotate(${rotation + additionalRotation})`);
            tile.style.stroke = "black";
            tile.style.strokeWidth = "0.1";
            cell.appendChild(tile);
        }
        svgcanvas.appendChild(cell);
    }
    const a = parameterAngle*Math.PI/180 - Math.PI/3;
    const s1 = size**2 * Math.sqrt(3) / 4;
    const s2 = 1/2*size*parameterSegment*Math.sin(a);
    const s3 = Math.sqrt(3)/12*(size**2+parameterSegment**2-2*size*parameterSegment*Math.cos(a));
    const s = 6*(s1+s2+s3);
    const step = Math.pow(108, 1/4)/3*Math.sqrt(s);

    createPrimitiveCell(start);
    for (let layer = 1; layer < count; layer++) {
        for (let angle = 0; angle < 2*Math.PI; angle += 2*Math.PI/6) {
            for (let i = 0; i < layer; i++) {
            createPrimitiveCell({
                x: start.x + layer*step*Math.cos(angle) + i*step*Math.cos(angle + 2*Math.PI/3),
                y: start.y + layer*step*Math.sin(angle) + i*step*Math.sin(angle + 2*Math.PI/3)
            });
            }
        }
    }
}