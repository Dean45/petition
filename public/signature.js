(function() {
    const paintCanvas = document.querySelector(".signature");
    const context = paintCanvas.getContext( '2d' );
    context.lineCap = 'round';
    context.strokeStyle = "#64994b";

    const sig = document.getElementById("sig");
    //    console.log(sig);

    let x = 0, y = 0;
    let isMouseDown = false;

    const stopDrawing = () => { isMouseDown = false; };
    const startDrawing = event => {
        isMouseDown = true;
        [x, y] = [event.offsetX, event.offsetY];
    };
    const drawLine = event => {
        if ( isMouseDown ) {
            const newX = event.offsetX;
            const newY = event.offsetY;
            context.beginPath();
            context.moveTo( x, y );
            context.lineTo( newX, newY );
            context.stroke();
            [x, y] = [newX, newY];
            var dataURL = paintCanvas.toDataURL();
            sig.value = dataURL;
            //            console.log(sig.value);
        }
    };

    paintCanvas.addEventListener( 'mousedown', startDrawing );
    paintCanvas.addEventListener( 'mousemove', drawLine );
    paintCanvas.addEventListener( 'mouseup', stopDrawing);
    paintCanvas.addEventListener( 'mouseout', stopDrawing );
}());
