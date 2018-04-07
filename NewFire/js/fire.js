var app={};
class Particle{
  constructor(pos,vel,acc)
  {
    this.position=pos;
    this.velocity=vel;
    this.acceleration=acc;
    this.alpha=1;
  }
}
var time=new THREE.Clock();
var SphereGeometry;
var SphereMaterial=[];
var sphere=[];
var particle=[];
var spread=0.5,spreadSmoke=0.2;
var particlesmoke=[];
var smokeCube=[];
var smoke=[];var newmesh=[];
var Shadermaterial;
var wind=0;
var guiControls=new function(){
  this.windX=0.0;
  this.windY=0.0;
  this.windZ=0.0;
  this.FireParticles=2000;
  this.SmokeParticles=1500;
}
var pos,vel,acc,sphere,geometry,material,y=0,i=0,spread=5;
init();
function randomInt(min,max)
{
    return Math.random()*(max-min+1)+min;
}

function init()
{
app.scene=new THREE.Scene();
 // initialising the scene

// var texture = new THREE.TextureLoader().load( "images/skybox/front.png" );
// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set( 4, 4 );
// app.scene.background=new THREE.TextureLoader().load(texture);
app.scene.background=new THREE.Color(0x8B4513);
app.camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
app.camera.position.set(0,30,50);
app.renderer=new THREE.WebGLRenderer();
app.renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(app.renderer.domElement);
console.log("About to run shader");

addLights();
//skybox();
setSceneControls();
cube();
animate();
}

function addLights()
{
   var light2= new THREE.DirectionalLight(0xffffff,1);
  light2.position.set(10,10,5).normalize();
  light2.target.position.set(0,1,1);
  app.scene.add(light2);

  var light3= new THREE.DirectionalLight(0xffffff,1);
  light3.position.set(0,10,10).normalize();
  light3.target.position.set(0,1,1);
  app.scene.add(light3);

  var light4= new THREE.DirectionalLight(0xffffff,1);
  light4.position.set(0,10,10).normalize();
  light4.target.position.set(1,1 ,0);
  app.scene.add(light4);

  var datGUI=new dat.GUI();
  datGUI.add(guiControls, 'windY', -0.001, 0.001);
  datGUI.add(guiControls,'windX',-0.001,0.001);
  datGUI.add(guiControls,'windZ',-0.001,0.001);
   datGUI.add(guiControls,'FireParticles',0,2000);
  // datGUI.add(guiControls,'SmokeParticles',0,2000);
}


function setSceneControls()
{
  app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);
  app.camera.position.z = 50;

}

function cube()
{
	var size = 10;
  var divisions = 20;

  var gridHelper = new THREE.GridHelper( size, divisions );
  app.scene.add( gridHelper );
  var axes = new THREE.AxisHelper(2);
  app.scene.add(axes);
  SphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
  SmokeGeometry=new THREE.SphereGeometry(0.1,32,32);
  wind=new THREE.Vector3(0,0,0);
  var loader = new THREE.BufferGeometryLoader();
// load a resource
loader.load( 'js/untitled.json', function ( geometry ) {
        var material = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture("images/grass.jpg") } );
        mesh = new THREE.Mesh(geometry, material);

        newmesh[0]=mesh.clone();
        newmesh[0].position.set(5,0,0);
        newmesh[1]=mesh.clone();
        newmesh[1].position.set(0,0,2.5);
        app.scene.add(newmesh[1]);
        newmesh[2]=mesh.clone();
        newmesh[2].position.set(-5,0,0);
        app.scene.add(newmesh[2]);
        newmesh[3]=mesh.clone();
        newmesh[3].position.set(-5,0,2.5);
        app.scene.add(newmesh[3]);
        newmesh[4]=mesh.clone();
        newmesh[4].position.set(5,0,2.5);
        app.scene.add(newmesh[4]);
        app.scene.add(newmesh[0]);

        app.scene.add( mesh );

    }
)
// var particles=new THREE.Geometry();
// for (var p = 0; p < 2000; p++) {
//
//        // This will create all the vertices in a range of -200 to 200 in all directions
//        var x = Math.random() * 400 - 200;
//        var y = Math.random() * 400 - 200;
//        var z = Math.random() * 400 - 200;
//
//        // Create the vertex
//        var particlex = new THREE.Vector3(x, y, z);
//
//        // Add the vertex to the geometry
//        particles.vertices.push(particlex);
//    }
  initialize();
  initializeSmoke();
}

function update(particle,i)
{
  particle.velocity.add(particle.acceleration);
  particle.velocity.y+=0.0002;
  particle.velocity.z+=guiControls.windZ;
  particle.velocity.x+=guiControls.windX;
  particle.position.add(particle.velocity);
  particle.alpha-=0.01;
  SphereMaterial[i].opacity=particle.alpha;
  if(SphereMaterial[i].opacity<0.03||particle.position.y>5){//||Math.abs(particle.position.x)>2||Math.abs(particle.position.z)>2 ){
    particle.position.set(randomInt(-50-spread,50+spread)/1000,0,randomInt(-50-spread,50+spread)/1000);
    spread+=0.5;
    particle.alpha=1;
    particle.velocity.set(randomInt(-10,10)/10000,randomInt(1,20)/5000,randomInt(-10,10)/10000);
    particle.acceleration.set(randomInt(-1,1)/5000,randomInt(1,20)/10000,randomInt(-1,1)/5000);
    console.log("newParticle");
    

  }

  draw(particle.position,i);

}

function draw(position,i)
{

  sphere[i].position.set(particle[i].position.x,particle[i].position.y,particle[i].position.z);
  app.scene.add( sphere[i] );

}
function updateSmoke(particlesmoke,j)
{
  particlesmoke.velocity.add(particlesmoke.acceleration);
  particlesmoke.velocity.z+=guiControls.windZ;
  particlesmoke.velocity.x+=guiControls.windX;
  particlesmoke.position.add(particlesmoke.velocity);
  particlesmoke.alpha-=0.007 ;
  smokeCube[j].opacity=particlesmoke.alpha;
  if(smokeCube[j].opacity<0.02||particlesmoke.position.y>10){//||Math.abs(particle.position.x)>2||Math.abs(particle.position.z)>2 ){
    particlesmoke.position.set(randomInt(-30-spreadSmoke,30+spreadSmoke)/100,0,randomInt(-30-spreadSmoke,30+spreadSmoke)/100);
    spreadSmoke+=0.1;
    particlesmoke.alpha=1;
    particlesmoke.velocity.set(randomInt(-3,3)/10000,randomInt(1,5)/15000,randomInt(-3,3)/10000);
    particlesmoke.acceleration.set(randomInt(-0.5,0.5)/10000,randomInt(1,20)/10000,randomInt(-1,1)/10000);

  }
  drawsmoke(particlesmoke.position,j);
}
function initializeSmoke()
{
  for(var j=0;j<guiControls.SmokeParticles;j++)
  {
    posSmoke=new THREE.Vector3(randomInt(-30,30)/100,0,randomInt(-30,30)/100);
    velSmoke=new THREE.Vector3(randomInt(-3,3)/10000,randomInt(1,5)/15000,randomInt(-3,3)/10000);
    accSmoke=new THREE.Vector3(randomInt(-0.5,0.5)/10000,randomInt(1,20)/10000,randomInt(-1,1)/10000);
    smokeCube[j] = new THREE.MeshLambertMaterial( {color: 0x393d44, transparent:true} );
    particlesmoke[j]=new Particle(posSmoke,velSmoke,accSmoke);
    smoke[j] = new THREE.Mesh( SmokeGeometry, smokeCube[j] );
    drawsmoke(smoke[j].position,j)

    //drawsmoke(particlesmoke[i].position,i);
  }
}
function drawsmoke(position,j)
{
  smoke[j].position.set(particlesmoke[j].position.x,particlesmoke[j].position.y,particlesmoke[j].position.z);
  app.scene.add( smoke[j] );
}
function initializeOneFireParticle()
{
  pos=new THREE.Vector3(randomInt(-10,10)/1000,0,randomInt(-10,10)/1000 );
 vel=new THREE.Vector3(randomInt(-5,5)/10000,randomInt(1,20)/5000,randomInt(-5,5)/10000);
 acc=new THREE.Vector3(randomInt(-1,1)/10000,randomInt(1,20)/5000,randomInt(-1,1)/10000);
 console.log(i);
 SphereMaterial[i] = new THREE.MeshLambertMaterial( {color: 0xe25822, transparent:true} );
 particle[i]=new Particle(pos,vel,acc);
 sphere[i] = new THREE.Mesh( SphereGeometry, SphereMaterial[i] );
 draw(particle[i].position,i);
}
function initialize()
{
    for(i=0;i<500;i++)
      initializeOneFireParticle();

}
function animate() {

    requestAnimationFrame( animate );

    for(i=0;i<500;i++)
    {
      update(particle[i],i);


    }
    for(j=0;j<guiControls.SmokeParticles;j++)
    {
      updateSmoke(particlesmoke[j],j);

    }

     //initialize();
    app.renderer.render( app.scene, app.camera );


  }
