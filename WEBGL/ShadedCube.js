"use strict";

var shadedCube = function () {
  var canvas;
  var gl;

  var numPositions = 36;

  //texture data 설정
  var idx = 0;
  var direction = 1;
  var texSize = 64;
  var texture = {};
  var textureApple;
  var texturePineapple;
  var textureWatermelon;

  var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

  var positionsArray = [];
  var normalsArray = [];
  var texCoordsArray = [];

  var positions = [
    vec4(-5, 0, 0, 1),
    vec4(5, 0, 0, 1),
    vec4(0, -5, 0, 1),
    vec4(0, 5, 0, 1),
    vec4(0, 0, -5, 1),
    vec4(0, 0, 5, 1),
  ];

  var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  //좌표축의 색
  var colors = [
    vec4(1, 0, 0, 1),
    vec4(1, 0, 0, 1),
    vec4(0, 1, 0, 1),
    vec4(0, 1, 0, 1),
    vec4(0, 0, 1, 1),
    vec4(0, 0, 1, 1),
  ];

  var lightPosition = vec4(0, 1, 2, 0.0);
  var lightAmbient = vec4(1, 1, 1, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1, 1, 1, 1.0);

  var texMaterialAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  var texMaterialDiffuse = vec4(0.9, 0.9, 0.9, 1.0);
  var texMaterialSpecular = vec4(0.1, 0.1, 0.1, 1.0);

  var materialAmbient = vec4(0.2, 0.2, 0.0, 1.0);
  var materialDiffuse = vec4(0.9, 0.9, 0.0, 1.0);
  var materialSpecular = vec4(0.1, 0.1, 0, 1.0);
  var materialShininess = 70.0;

  var ctm;
  var ambientColor, diffuseColor, specularColor;
  var modelViewMatrix, projectionMatrix;
  var viewerPos;
  var program;

  var xAxis = 0;
  var yAxis = 1;
  var zAxis = 2;
  var axis = zAxis;
  var theta = vec3(0, 0, 0);
  var eye = vec3(0.6, 0.6, 0.6);
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0, 1, 0);

  var thetaLoc;

  function configureTexture(image) {
    texture[idx] = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture[idx]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    idx += 1;
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
  }

  var flag = true;

  function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    // 1 0 3 2
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);
  }

  function quadNonTexure(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      mult(lightAmbient, materialAmbient)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      mult(lightDiffuse, materialDiffuse)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      mult(lightSpecular, materialSpecular)
    );

    // 1 0 3 2
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
  }

  function colorCube() {
    quadNonTexure(1, 0, 3, 2);
    quad(2, 3, 7, 6); //fruit apple
    quad(3, 0, 4, 7); //fruit pineApple
    quadNonTexure(6, 5, 1, 2); //fruit watermelon
    quadNonTexure(4, 5, 6, 7);
    quad(5, 4, 0, 1);
  }

  window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    colorCube();
    for (let i = 0; i < 6; ++i) texCoordsArray.push(texCoord[0]); //좌표축을 위해 텍스쳐 매핑한듯

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");

    var image1 = document.getElementById("texApple");
    var image2 = document.getElementById("texPineapple");
    var image3 = document.getElementById("texWatermelon");

    configureTexture(image1);
    configureTexture(image2);
    configureTexture(image3);

    viewerPos = vec3(1, 1, -1.0);

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonClock").onclick = function () {
      direction = 1;
    };
    document.getElementById("ButtonCounterClock").onclick = function () {
      direction = -1;
    };
    document.getElementById("ButtonT").onclick = function () {
      flag = !flag;
    };

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );

    gl.uniform1f(
      gl.getUniformLocation(program, "uShininess"),
      materialShininess
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
    );
    render();
  };

  var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += direction * 1.5;

    modelViewMatrix = lookAt(eye, at, up);

    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[zAxis], vec3(0, 0, 1))
    );

    //console.log(modelView);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
    );

    gl.uniform4fv(gl.getUniformLocation(program, "uIsAxe"), vec4(0, 0, 0, 0));

    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    // for (let i = 0; i < 6; ++i) {
    //   //i = 1 , 2 , 5일 때 텍스쳐 매핑 해줘야 함
    //   if (i == 1) gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //   if (i == 2) gl.bindTexture(gl.TEXTURE_2D, texture[1]);
    //   if (i == 5) gl.bindTexture(gl.TEXTURE_2D, texture[2]);

    //   gl.drawArrays(gl.TRIANGLES, i * 6, 6);
    // }

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      mult(lightAmbient, texMaterialAmbient)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      mult(lightDiffuse, texMaterialDiffuse)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      mult(lightSpecular, texMaterialSpecular)
    );

    //텍스쳐 있는 면그리기
    gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    gl.drawArrays(gl.TRIANGLES, 1 * 6, 6);
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);
    gl.drawArrays(gl.TRIANGLES, 2 * 6, 6);
    gl.bindTexture(gl.TEXTURE_2D, texture[2]);
    gl.drawArrays(gl.TRIANGLES, 5 * 6, 6);

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      mult(lightAmbient, materialAmbient)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      mult(lightDiffuse, materialDiffuse)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      mult(lightSpecular, materialSpecular)
    );
    gl.drawArrays(gl.TRIANGLES, 0 * 6, 6);
    gl.drawArrays(gl.TRIANGLES, 3 * 6, 6);
    gl.drawArrays(gl.TRIANGLES, 4 * 6, 6);

    //좌표 축그리기
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
    );

    gl.uniform4fv(gl.getUniformLocation(program, "uIsAxe"), vec4(1, 1, 1, 1));
    gl.drawArrays(gl.LINES, 0, 2);

    gl.uniform4fv(gl.getUniformLocation(program, "uIsAxe"), vec4(2, 2, 2, 2));
    gl.drawArrays(gl.LINES, 2, 2);

    gl.uniform4fv(gl.getUniformLocation(program, "uIsAxe"), vec4(3, 3, 3, 3));
    gl.drawArrays(gl.LINES, 4, 2);

    //gl.drawArrays(gl.LINES, 0, 6);

    //console.log(texCoordsArray.length);
    requestAnimationFrame(render);
  };
};

shadedCube();
