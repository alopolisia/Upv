// MultiTexture.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
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
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '  vec4 color0 = texture2D(u_Sampler, v_TexCoord);\n' +
  '  gl_FragColor = color0;\n' +
  '}\n';

//Matrices necesarios
var inicioMatrix = new Matrix4();

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

//Metodos para hacer push y pop de matrices
var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

//Variables de la camara------------------------------------------------------------------------------
//CAMARA-------------------------------------------------------------------------------------------
function F3dVector(x,y,z){
   var SF3dVector = {
       x: x,
       y: y,
       z: z
   };

   return SF3dVector;
}

function GetF3dVectorLength(v){
   var result = Math.sqrt(Math.pow(v.x,2)+ Math.pow(v.y,2) + Math.pow(v.z,2));
   return result;
}

function Normalize3dVector(v) {
    console.log(v.x);
    console.log(v.y);
    console.log(v.z);
   var result = F3dVector(0.0, 0.0, 0.0);
   var l = GetF3dVectorLength(v);

   if (l != 0.0) {
       result.x = v.x / l;
       result.y = v.y / l;
       result.z = v.z / l;
       return result;
   }
}

function suma(v, u){
   var result = F3dVector(0.0, 0.0, 0.0);
   result.x = v.x + u.x;
   result.y = v.y + u.y;
   result.z = v.z + u.z;
   return result;
}

function resta(v, u){
   var result = F3dVector(0.0, 0.0, 0.0);
   result.x = v.x - u.x;
   result.y = v.y - u.y;
   result.z = v.z - u.z;
   return result;
}

function multiplicar(v, r){
   var result = F3dVector(0.0, 0.0, 0.0);
   result.x = v.x * r;
   result.y = v.y * r;
   result.z = v.z * r;
   return result;
}

function ProductoCruzado(u, v){
   var result = F3dVector(0.0, 0.0, 0.0);
   result.x = u.y * v.z - u.z * v.y;
   result.y = u.z * v.x - u.x * v.z;
   result.z = u.x * v.y - u.y * v.x;
   return result;
}

function multiplicar_F3d(v, u){
   var result = 0.0;
   result = v.x * u.x + v.y * u.y + v.z * u.z;
   return result;
}

var Position = F3dVector(0.0, 0.0, 0.0);
var ViewDir = F3dVector(0.0, 0.0, -1.0);
var RightVector = F3dVector(1.0, 0.0, 0.0);
var UpVector = F3dVector(0.0, 1.0, 0.0);
var Direction = F3dVector(0.0, 0.0, 3.0);

var RotatedX = 0.0;
var RotatedY = 0.0;
var RotatedZ = 0.0;
const PI = 3.1415926535897932384626433832795;
var PIdiv180 = PI / 180.0;

function RotateX(angulo){
    RotatedX += angulo;
    var temp1 = F3dVector(0.0, 0.0, 0.0);
    temp1 = multiplicar(ViewDir, Math.cos(angulo*PIdiv180));

    var temp2 = F3dVector(0.0, 0.0, 0.0);
    temp2 = multiplicar(UpVector , Math.sin(angulo*PIdiv180));

    ViewDir = Normalize3dVector(suma(temp1, temp2));

    UpVector = multiplicar(ProductoCruzado(ViewDir, RightVector), -1);
}

function RotateY(angulo){
    RotatedY += angulo;
    var temp1 = F3dVector(0.0, 0.0, 0.0);
    temp1 = multiplicar(ViewDir, Math.cos(angulo*PIdiv180));

    var temp2 = F3dVector(0.0, 0.0, 0.0);
    temp2 = multiplicar(RightVector , Math.sin(angulo*PIdiv180));

    ViewDir = Normalize3dVector(resta(temp1, temp2));

    RightVector = ProductoCruzado(ViewDir, UpVector);
}

function Move(Direction){
   Position = suma(Position, Direction);
}

function MoveForward(Distance) {
   // Position = Position + (ViewDir*-Distance);
   Position = suma(Position, multiplicar(ViewDir , -Distance));
}

function StrafeRight(Distance){
    Position = suma(Position , multiplicar(RightVector,Distance));
}

function MoveUpward(Distance) {
   // Position = Position + (ViewDir*-Distance);
   Position = suma(Position, multiplicar(UpVector , Distance));
}

function actualizar_vista(gl, canvas, u_MvpMatrix){
   var ViewPoint = F3dVector(0.0, 0.0, 0.0);
   ViewPoint = suma(Position , ViewDir);

   g_modelMatrix.setPerspective(30, (canvas.width)/(canvas.height), 0.1, 10000000);
   g_modelMatrix.lookAt(Position.x,Position.y,Position.z,
                         ViewPoint.x,ViewPoint.y,ViewPoint.z,
                         UpVector.x,UpVector.y,UpVector.z);

   inicioMatrix.set(g_modelMatrix);

   //gl.uniformMatrix4fv(u_MvpMatrix, false, g_modelMatrix.elements);
}
//----------------------------------------------------------------------------------------------------


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

    gl.clearColor(0, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Set texture
	if (!initTextures(gl)) {
		console.log('Failed to intialize the texture.');
		return;
	}

    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
    }

    //Registrar el evento del teclado
    initKeyboardCallback(gl, canvas, u_MvpMatrix);

    //Desplegar todo :v
    display(gl, canvas, u_MvpMatrix);

}

function display(gl, canvas, u_MvpMatrix){
    actualizar_vista(gl, canvas, u_MvpMatrix);
    cargar_modelo(gl, canvas, u_MvpMatrix);
}

function cargar_modelo(gl, canvas, u_MvpMatrix) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Base de cesped
    base_cesped(gl, canvas, u_MvpMatrix);

    //Inicia en el 0,0,0---------------------------------------------------------------------------

    //Edificio de ITI
    edificio_A(gl, canvas, u_MvpMatrix);

    //Entre la graficación de cada edificio se resetea
    g_modelMatrix.set(inicioMatrix);

    //Edificio de PYMES :v
    edificio_B(gl, canvas, u_MvpMatrix);

    g_modelMatrix.set(inicioMatrix);

    //Edificio de los talleres
    edificio_H(gl, canvas, u_MvpMatrix);

    g_modelMatrix.set(inicioMatrix);

    //Edificio de los cubos y de manu
    edificio_I(gl, canvas, u_MvpMatrix);

}

//Edificios---------------------------------------------------------------------------------------------
function edificio_A(gl, canvas, u_MvpMatrix){

    pushMatrix(g_modelMatrix);
    prisma_cuadrangular(gl, u_MvpMatrix, 50, 30, 20, image0, texture0);
    g_modelMatrix = popMatrix();

}

function edificio_B(gl, canvas, u_MvpMatrix){

}

function edificio_H(gl, canvas, u_MvpMatrix){

}

function edificio_I(gl, canvas, u_MvpMatrix){

}

function base_cesped(gl, canvas, u_MvpMatrix){
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-100,-0.1,100);
    piso_o_techo(gl, u_MvpMatrix, 200, 200, imagen_cesped, textura_cesped);
    g_modelMatrix = popMatrix();
}

//------------------------------------------------------------------------------------------------------

//Objetos-----------------------------------------------------------------------------------------------

//Cuadrilatero parado en el eje de los X
function pared_X(gl, u_MvpMatrix, largo, alto, imagen, textura){
    g_mvpMatrix.set(g_modelMatrix);

    var vertices = new Float32Array([
         0,     0,    0 , 0.0, 0.0,
         0,     alto, 0 , 0.0, 1.0,
         largo, 0,    0 , 1.0, 0.0,
         largo, alto, 0 , 1.0, 1.0,
    ]);

    n = vertices.length / 5; // The number of vertices

    //Cargar buffers de vertices, posicion y textura
    cargar_vertices_posicion_textura(gl, vertices);

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

	loadTexture(gl, textura, u_Sampler, imagen);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
}

//Cuadrilatero parado en el eje de los Z
function pared_Z(gl, u_MvpMatrix, largo, alto, imagen, textura){
    g_mvpMatrix.set(g_modelMatrix);

    var vertices = new Float32Array([
         0,     0,      0      , 0.0, 0.0,
         0,     alto,   0      , 0.0, 1.0,
         0,     0,      -largo , 1.0, 0.0,
         0,     alto,   -largo , 1.0, 1.0,
    ]);

    n = vertices.length / 5; // The number of vertices

    //Cargar buffers de vertices, posicion y textura
    cargar_vertices_posicion_textura(gl, vertices);

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

	loadTexture(gl, textura, u_Sampler, imagen);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
}

//Cuadrilatero acostado
function piso_o_techo(gl, u_MvpMatrix, largo, ancho, imagen, textura){
    g_mvpMatrix.set(g_modelMatrix);

    var vertices = new Float32Array([
         0,     0,    0     , 0.0, 0.0,
         0,     0,   -ancho , 0.0, 1.0,
         largo, 0,    0     , 1.0, 0.0,
         largo, 0,   -ancho , 1.0, 1.0,
    ]);

    n = vertices.length / 5; // The number of vertices

    //Cargar buffers de vertices, posicion y textura
    cargar_vertices_posicion_textura(gl, vertices);

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

	loadTexture(gl, textura, u_Sampler, imagen);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
}

//Prisma Cuadrancular
function prisma_cuadrangular(gl, u_MvpMatrix, largo, ancho, alto, imagen, textura){
    g_mvpMatrix.set(g_modelMatrix);

    //Para evitar escribir mas codigo xd, la hare juntando las piezas de paredes y pisos

    //Cara frontal y trasera
    pared_X(gl, u_MvpMatrix, largo, alto, imagen, textura);
    g_modelMatrix.translate(0,0,-ancho);
    pared_X(gl, u_MvpMatrix, largo, alto, imagen, textura);
    g_modelMatrix.translate(0,0,ancho);

    //Cara izquierda
    pared_Z(gl, u_MvpMatrix, ancho, alto, imagen, textura);

    //Piso
    piso_o_techo(gl, u_MvpMatrix, largo, ancho, imagen, textura);
    g_modelMatrix.translate(largo,0,0);

    //Cara derecha
    pared_Z(gl, u_MvpMatrix, ancho, alto, imagen, textura);
    g_modelMatrix.translate(-largo,alto,0);

    //Techo
    piso_o_techo(gl, u_MvpMatrix, largo, ancho, imagen, textura);
    g_modelMatrix.translate(0,-alto,0);

}

function cilindro(){

}

//--------------------------------------------------------------------------------------------------------

function cargar_vertices_posicion_textura(gl, vertices){
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
}

//Texturas--------------------------------------------------------------------------------------------

//Variables necesarios
var u_Sampler0;
var texture0;
var texture1;
var texture2;
var texture3;
var image0;
var image1;
var image2;
var image3;

//Imagenes y texturas-------------------------------Aqui se declaran imagen y textura
var imagen_cesped;
var textura_cesped;
var imagen_amarillo;
var textura_amarillo;
var imagen_azul;
var textura_azul;
var imagen_azulindigo;
var textura_azulindigo;
var imagen_blanco;
var textura_blanco;
var imagen_cafe;
var textura_cafe;
var imagen_crema;
var textura_crema;
var imagen_cyan;
var textura_cyan;
var imagen_entradaPrincipal;
var textura_entradaPrincipal;
var imagen_fucsia;
var textura_fucsia;
var imagen_gindo;
var textura_gindo;
var imagen_gris;
var textura_gris;
var imagen_grisclaro;
var textura_grisclaro;
var imagen_morado;
var textura_morado;
var imagen_naranja;
var textura_naranja;
var imagen_negro;
var textura_negro;
var imagen_oro;
var textura_oro;
var imagen_pisoupv;
var textura_pisoupv;
var imagen_puerta1;
var textura_puerta1;
var imagen_purpura;
var textura_purpura;
var imagen_rojo;
var textura_rojo;
var imagen_verde;
var textura_verde;
var imagen_verdefosfo;
var textura_verdefosfo;

function initTextures(gl) {
  // Create a texture object
  texture0 = gl.createTexture();
  texture1 = gl.createTexture();
  texture2 = gl.createTexture();
  texture3 = gl.createTexture();
  textura_cesped = gl.createTexture();
  textura_azul = gl.createTexture();
  textura_amarillo = gl.createTexture();
  textura_azulindigo = gl.createTexture();
  textura_oro = gl.createTexture();
  textura_cafe = gl.createTexture();
  textura_cyan = gl.createTexture();
  textura_gris = gl.createTexture();
  textura_gindo = gl.createTexture();
  textura_crema = gl.createTexture();
  textura_negro = gl.createTexture();
  textura_fucsia = gl.createTexture();
  textura_blanco = gl.createTexture();
  textura_morado = gl.createTexture();
  textura_naranja = gl.createTexture();
  textura_pisoupv = gl.createTexture();
  textura_puerta1 = gl.createTexture();
  textura_grisclaro = gl.createTexture();
  textura_entradaPrincipal = gl.createTexture();

  if (!texture0 || !texture1 || !texture2) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');

  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  image0 = new Image();
  image1 = new Image();
  image2 = new Image();
  image3 = new Image();

  imagen_cesped = new Image();
  imagen_negro  = new Image();
  imagen_naranja = new Image();
  imagen_entradaPrincipal = new Image();
  imagen_oro = new Image();
  imagen_azul = new Image();
  imagen_gris = new Image();
  imagen_cafe = new Image();
  imagen_cyan = new Image();
  imagen_gindo = new Image();
  imagen_crema = new Image();
  imagen_blanco = new Image();
  imagen_fucsia = new Image();
  imagen_morado = new Image();
  imagen_pisoupv = new Image();
  imagen_puerta1 = new Image();
  imagen_amarillo = new Image();
  imagen_grisclaro = new Image();
  imagen_azulindigo = new Image();

  if (!image0 || !image1 || !image2) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, texture0, u_Sampler, image0); };
  image1.onload = function(){ loadTexture(gl, texture1, u_Sampler, image1); };
  image2.onload = function(){ loadTexture(gl, texture2, u_Sampler, image2); };
  image3.onload = function(){ loadTexture(gl, texture3, u_Sampler, image3); };

  imagen_cesped.onload = function(){ loadTexture(gl, textura_cesped, u_Sampler, imagen_cesped); };
  imagen_oro.onload = function(){ loadTexture(gl, textura_oro, u_Sampler, imagen_oro); };
  imagen_cafe.onload = function(){ loadTexture(gl, textura_cafe, u_Sampler, imagen_cafe); };
  imagen_cyan.onload = function(){ loadTexture(gl, textura_cyan, u_Sampler, imagen_cyan); };
  imagen_azul.onload = function(){ loadTexture(gl, textura_azul, u_Sampler, imagen_azul); };
  imagen_gris.onload = function(){ loadTexture(gl, textura_gris, u_Sampler, imagen_gris); };
  imagen_crema.onload = function(){ loadTexture(gl, textura_crema, u_Sampler, imagen_crema); };
  imagen_gindo.onload = function(){ loadTexture(gl, textura_gindo, u_Sampler, imagen_gindo); };
  imagen_negro.onload = function(){ loadTexture(gl, textura_negro, u_Sampler, imagen_negro); };
  imagen_blanco.onload = function(){ loadTexture(gl, textura_blanco, u_Sampler, imagen_blanco); };
  imagen_fucsia.onload = function(){ loadTexture(gl, textura_fucsia, u_Sampler, imagen_fucsia); };
  imagen_morado.onload = function(){ loadTexture(gl, textura_morado, u_Sampler, imagen_morado); };
  imagen_pisoupv.onload = function(){ loadTexture(gl, textura_pisoupv, u_Sampler, imagen_pisoupv); };
  imagen_puerta1.onload = function(){ loadTexture(gl, textura_puerta1, u_Sampler, imagen_puerta1); };
  imagen_naranja.onload = function(){ loadTexture(gl, textura_naranja, u_Sampler, imagen_naranja); };
  imagen_amarillo.onload = function(){ loadTexture(gl, textura_amarillo, u_Sampler, imagen_amarillo); };
  imagen_grisclaro.onload = function(){ loadTexture(gl, textura_grisclaro, u_Sampler, imagen_grisclaro); };
  imagen_azulindigo.onload = function(){ loadTexture(gl, textura_azulindigo, u_Sampler, imagen_azulindigo); };
  imagen_entradaPrincipal.onload = function(){ loadTexture(gl, textura_entradaPrincipal, u_Sampler, imagen_entradaPrincipal); };

  // Tell the browser to load an Image
  image1.src = './resources/white.jpg';
  image2.src = './resources/pared.jpg';
  image0.src = './resources/wood2.jpg';
  image3.src = './resources/naranja.jpg';
  imagen_cesped.src = './colores/cesped.jpg';
  imagen_oro.src = './colores/oro.png';
  imagen_cafe.src = './colores/cafe.png';
  imagen_cyan.src = './colores/cyan.png';
  imagen_azul.src = './colores/azul.png';
  imagen_gris.src = './colores/gris.png';
  imagen_crema.src = './colores/crema.png';
  imagen_gindo.src = './colores/gindo.png';
  imagen_negro.src = './colores/negro.png';
  imagen_blanco.src = './colores/blanco.png';
  imagen_fucsia.src = './colores/fucsia.png';
  imagen_morado.src = './colores/morado.png';
  imagen_pisoupv.src = './colores/pisoupv.png';
  imagen_puerta1.src = './colores/puerta1.png';
  imagen_naranja.src = './colores/naranja.png';
  imagen_amarillo.src = './colores/amarillo.png';
  imagen_grisclaro.src = './colores/grisclaro.png';
  imagen_azulindigo.src = './colores/azulindigo.png';
  imagen_entradaPrincipal.src = './colores/entradaPrincipal.png';

  return true;
}

// Specify whether the texture unit is ready to use
function loadTexture(gl, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    // Make the texture unit active

    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set texture parameters
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, 0);   // Pass the texure unit to u_Sampler

}

 function initKeyboardCallback(gl, canvas, u_MvpMatrix) {
     document.onkeydown = function(event) {
         switch(event.keyCode) {
             case 82: // Use r or R to turn on/off camera rolling.
                 MoveUpward(3.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 70: // Use a or A to turn on/off animation.
                 MoveUpward(-3.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 38: // Use + key to zoom in.
                 RotateX(5.0); // lower limit of fov
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 40: // Use - key to zoom out.
                 RotateX(-5.0); // lower limit of fov
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 37: // Use left arrow to move the camera to the left.
                 RotateY(5.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 39: // Use right arrow to move the camera to the right.
                 RotateY(-5.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 87: // Use up arrow to move the camera forward.
                 MoveForward(-1.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 83: // Use down arrow to move the camera backward.
                 MoveForward(1.0);
                 display(gl, canvas, u_MvpMatrix);
                 break;
             case 65: // Use u or U key to move the camera upward.
                StrafeRight(-1.0);
                display(gl, canvas, u_MvpMatrix);
                break;
             case 68: // Use d or D key to move the camera downward.
                StrafeRight(1.0);
                display(gl, canvas, u_MvpMatrix);
                break;
             default: return;
         }
     }
 }
