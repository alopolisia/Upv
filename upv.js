// MultiTexture.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
//'  gl_Position = u_ModelMatrix * u_ViewMatrix * a_Position;\n' +
//'  gl_Position = u_ModelMatrix * u_ViewMatrix * u_ProjMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '  vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
  '  gl_FragColor = color0;\n' +
  '}\n';

  // Camera control parameters
  var pitchAngle = 0;
  var minPitchAngle = -90;
  var maxPitchAngle = 90;

  var yawAngle = 0;
  var minYawAngle = -90;
  var maxYawAngle = 90;

  var rollCamera = false;

  var rollAngle = 0;
  var minRollAngle = -180;
  var maxRollAngle = 180;

  var trackLeftRight = 0;
  var pushInPullOut = 0;
  var craneUpDown = 0;

  var step = 0.5;

  var fov = 30;
  var fovMin = 10;
  var fovMax = 160;


/////////////////////////////
var texture0;
var texture1;
var texture2;
var texture3;
var u_Sampler0;
var image0;
var image1;
var image2;
var image3;
//var gl;


function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
		if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

    //initMouseMotionCallback(canvas);
    //initKeyboardCallback();
    gl.clearColor(0.2, 0.5, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Set texture
	if (!initTextures(gl)) {
		console.log('Failed to intialize the texture.');
		return;
	}

    // Get the storage location of u_MvpMatrix
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

/*
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }
/*
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
      console.log('Failed to get the storage location of u_ProjMatrix');
      return;
    }
*/


    var viewMatrix = new Matrix4();   // View projection matrix
    var modelMatrix = new Matrix4();  // Model matrix
    var projMatrix = new Matrix4();    // Model view projection matrix

    initMouseMotionCallback(canvas);

    initKeyboardCallback();


        //Cargar modelos-------------------------------------------------------------------------------------
        //cargar_perspectiva(gl, u_ProjMatrix, projMatrix, canvas);

        //cargar_vista(gl, u_ViewMatrix, viewMatrix);

    var tick = function() {

        //cargar_modelo(gl, u_ModelMatrix, u_ViewMatrix, modelMatrix, viewMatrix, canvas);
        cargar_modelo(gl, u_ModelMatrix, modelMatrix, canvas);

        //---------------------------------------------------------------------------------------------------

        //Combiniar las matrices-----------------------------------------------------------------------------

        //---------------------------------------------------------------------------------------------------

        //Dibujar--------------------------------------------------------------------------------------------


        requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
        //---------------------------------------------------------------------------------------------------
    };
    tick();


}

function cargar_modelo(gl, u_ModelMatrix, modelMatrix, canvas) {
//function cargar_modelo(gl, u_ModelMatrix, u_ViewMatrix, modelMatrix, viewMatrix, canvas) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    //modelMatrix = new Matrix4();

    modelMatrix.setPerspective(fov, (canvas.width)/(canvas.height), 0.1, 10000000);

    modelMatrix.translate(-trackLeftRight, 0, 0);

    // Move the camera vertically.
    // We are moving the entire scene to the opposite direction of the camera motion.
    modelMatrix.translate(0, -craneUpDown, 0);

    // Move the camera forward and backward.
    // We are moving the entire scene to the opposite direction of the camera motion.
    modelMatrix.translate(0, 0, pushInPullOut);

    // Rotations must be done before translation.

    // Camera pitch
    // We are rotating the entire scene in the opposite direction.
    modelMatrix.rotate(pitchAngle, 1, 0, 0);

    // Camera yaw
    // We are rotating the entire scene in the opposite direction.
    modelMatrix.rotate(yawAngle, 0, 1, 0);

    // Camera roll
    // We are rotating the entire scene in the opposite direction.
    modelMatrix.rotate(rollAngle, 0, 0, 1);

    //modelMatrix.lookAt(-trackLeftRight, -craneUpDown, pushInPullOut, 0, 0, 0, 0, 1, 0);
    modelMatrix.lookAt(0, 0, 100, 0, 0, 0, 0, 1, 0);
    //gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    //modelMatrix.rotate(180,0, 1, 0);
    //modelMatrix.rotate(180,1, 0, 0);
    //modelMatrix.translate(0,-10,-100);
    cuadrilatero(50,50, 1, gl, u_ModelMatrix, modelMatrix);

    //modelMatrix = new Matrix4();

    cuadrilatero(50,50, 0, gl, u_ModelMatrix, modelMatrix);

    //modelMatrix.setIdentity();
    //modelMatrix = new Matrix4();
    modelMatrix.translate(-30,20,10);
    cuadrilatero(50,50, 0, gl, u_ModelMatrix, modelMatrix);


}


function cuadrilatero(largo, ancho, tipo, gl, u_ModelMatrix, modelMatrix){
    var l = largo / 2.0;
    var a = ancho / 2.0;

    if (tipo == 0) {
        var vertices = new Float32Array([
            -l, a, 0 , 0.0, 0.0,
             l, a, 0 , 0.0, 1.0,
            -l, -a, 0 , 1.0, 0.0,
             l, -a, 0 , 1.0, 1.0,
        ]);
    } else {
        var vertices = new Float32Array([
            -l, 0, a , 0.0, 0.0,
             l, 0, a , 0.0, 1.0,
            -l, 0, -a , 1.0, 0.0,
             l, 0, -a , 1.0, 1.0,
        ]);
    }

    n = vertices.length / 5; // The number of vertices

    // Create a buffer object
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Write the positions of vertices to a vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
      console.log('Failed to get the storage location of a_TexCoord');
      return -1;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the buffer assignment

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	loadTexture(gl, texture0, u_Sampler0, image0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
}

function initTextures(gl) {
  // Create a texture object
  texture0 = gl.createTexture();
  texture1 = gl.createTexture();
  texture2 = gl.createTexture();
  texture3 = gl.createTexture();
  if (!texture0 || !texture1 || !texture2) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  //var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  //if (!u_Sampler0 || !u_Sampler1) {
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  image0 = new Image();
  image1 = new Image();
  image2 = new Image();
  image3 = new Image();
  if (!image0 || !image1 || !image2) {
    console.log('Failed to create the image object');
    return false;
  }



  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, texture0, u_Sampler0, image0); };
  image1.onload = function(){ loadTexture(gl, texture1, u_Sampler0, image1); };
  image2.onload = function(){ loadTexture(gl, texture2, u_Sampler0, image2); };
  image3.onload = function(){ loadTexture(gl, texture3, u_Sampler0, image3); };

  // Tell the browser to load an Image
  image1.src = './resources/white.jpg';
  image2.src = './resources/pared.jpg';
  image0.src = './resources/wood2.jpg';
  image3.src = './resources/naranja.jpg';

  return true;
}
// Specify whether the texture unit is ready to use
//var g_texUnit0 = false, g_texUnit1 = false;
function loadTexture(gl, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  //if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
  //  g_texUnit0 = true;
  //} //else {
    //gl.activeTexture(gl.TEXTURE1);
    //g_texUnit1 = true;
  //}
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set texture parameters
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, 0);   // Pass the texure unit to u_Sampler
 }

 // Register a keyboard callback function.
 function initKeyboardCallback() {
     document.onkeydown = function(event) {
         switch(event.keyCode) {
             case 82: // Use r or R to turn on/off camera rolling.
                 rollCamera = !rollCamera;
                 break;
             case 65: // Use a or A to turn on/off animation.
                 animated = !animated;
                 break;
             case 37: // Use left arrow to move the camera to the left.
                 trackLeftRight -= step;
                 break;
             case 38: // Use up arrow to move the camera forward.
                  pushInPullOut += step;
                  break;
             case 39: // Use right arrow to move the camera to the right.
                 trackLeftRight += step;
                 break;
             case 40: // Use down arrow to move the camera backward.
                 pushInPullOut -= step;
                 break;
             case 85: // Use u or U key to move the camera upward.
                 craneUpDown += step;
                 break;
             case 68: // Use d or D key to move the camera downward.
                 craneUpDown -= step;
                 break;
             case 107: // Use + key to zoom in.
                 fov -= step;
                 fov = Math.max(fov, fovMin); // lower limit of fov
                 break;
             case 109: // Use - key to zoom out.
                 fov += step;
                 fov = Math.min(fov, fovMax); // upper limit of fov
                 break;
             default: return;
         }
     }
 }

 var lastX = 0, lastY = 0;
 var dMouseX = 0, dMouseY = 0;
 var trackingMouseMotion = false;

 // Register mouse callback functions
 function initMouseMotionCallback(canvas) {

     // If a mouse button is pressed, save the current mouse location
     // and start tracking mouse motion.
     canvas.onmousedown = function(event) {
         var x = event.clientX;
         var y = event.clientY;

         var rect = event.target.getBoundingClientRect();
         // Check if the mouse cursor is in canvas.
         if (rect.left <= x && rect.right > x &&
             rect.top <= y && rect.bottom > y) {
             lastX = x;
             lastY = y;
             trackingMouseMotion = true;
         }
     }

     // If the mouse button is release, stop tracking mouse motion.
     canvas.onmouseup = function(event) {
         trackingMouseMotion = false;
     }

     // Calculate how far the mouse cusor has moved and convert the mouse motion
     // to rotation angles.
     canvas.onmousemove = function(event) {
         var x = event.clientX;
         var y = event.clientY;

         if (trackingMouseMotion) {
             var scale = 1;
             // Calculate how much the mouse has moved along X and Y axis, and then
             // normalize them based on the canvas' width and height.
             dMouseX = (x - lastX)/canvas.width;
             dMouseY = (y - lastY)/canvas.height;

             if (!rollCamera) {
                 // For camera pitch and yaw motions
                 scale = 30;
                 // Add the mouse motion to the current rotation angle so that the rotation
                 // is added to the previous rotations.
                 // Use scale to control the speed of the rotation.
                 yawAngle += scale * dMouseX;
                 // Impose the upper and lower limits to the rotation angle.
                 yawAngle = Math.max(Math.min(yawAngle, maxYawAngle), minYawAngle);

                 pitchAngle += scale * dMouseY;
                 pitchAngle = Math.max(Math.min(pitchAngle, maxPitchAngle), minPitchAngle);
             } else {
                 // For camera roll motion
                 scale = 100;

                 // Add the mouse motion delta to the rotation angle, don't just replace it.
                 // Use scale to control the speed of the rotation.
                 rollAngle += scale * dMouseX;
                 rollAngle %= 360;
             }
         }

         // Save the current mouse location in order to calculate the next mouse motion.
         lastX = x;
         lastY = y;
     }
 }
