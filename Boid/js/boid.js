var boid={};
var app={};
var x=10,y=4,z=10,j=0,sphere={};
var cposx,cposz;
var avelx,avelz;
var bool=1;
var time=0;
var count=0;
function createscene()
{
  app.scene=new THREE.Scene();
  app.camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
  app.camera.position.set(100,50,50);
  app.renderer=new THREE.WebGLRenderer();
  app.renderer.setSize(window.innerWidth,window.innerHeight);
  document.body.appendChild(app.renderer.domElement);
  addLights();
  setSceneControls();
  drawTable();
  circleBoids();
  animate();
}

function parseJson(callback)
{
  var httpreq=new XMLHttpRequest();
  httpreq.open('GET','js/boid.json');
  httpreq.onreadystatechange=function(){
    if(httpreq.readyState===4&&httpreq.status===200){
      var json=JSON.parse(httpreq.responseText);
      NoOfBoids=json.NoOfBoids;
      VelX=json.VelX;
      VelY=json.VelY;
      VelZ=json.VelZ;
      objects=json.objects;
      SpawnTime=json.SpawnTime;
      callback(NoOfBoids);
    }
  }
  httpreq.send(null);
}
function addLights()
{
   var light2= new THREE.DirectionalLight(0xffffff,0.5);
  light2.position.set(10,10,5).normalize();
  light2.target.position.set(0,1,0);
  app.scene.add(light2);

  var light3= new THREE.DirectionalLight(0xffffff,1);
  light3.position.set(0,10,10).normalize();
  light3.target.position.set(0,30,20);
  app.scene.add(light3);
}

function setSceneControls()
{
  app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);
  app.camera.position.z = 50;
}
function drawobstacles()
{
  for(i=0;i<objects.length;i++)
  {
    var geometry=new THREE.BoxGeometry(5,5,5);
    var material=new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/crate.jpg') });
    var obstacle=new THREE.Mesh(geometry,material);
    obstacle.position.set(objects[i].x,objects[i].y,objects[i].z);
    app.scene.add(obstacle);
  }

}
function drawTable()
{
  var geometry=new THREE.BoxGeometry(150,5,80);
  var material=new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/wood2.jpg') }) ;
  var tableTop=new THREE.Mesh(geometry,material);
  app.scene.add(tableTop);

  var legGeometry=new THREE.BoxGeometry(5,50,5);
  var legmaterial=new THREE.MeshLambertMaterial({color: 0x3d010d});
  var Leg=[];
  var x=70,z=37.5
  for(var i=0;i<4;i++)
  {
    Leg[i]=new THREE.Mesh(legGeometry,legmaterial);
    if(i===1)
    {
      z=-37.5;
    }
    if(i===2)
    {
      x=-70;
    }
    if(i===3)
    {
      z=37.5
    }
    Leg[i].position.set(x,-25,z);
    app.scene.add(Leg[i]);
  }
  geometry=new THREE.BoxGeometry(800,5,500);
  material=new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/floor1.jpg')} );
  var floor=new THREE.Mesh(geometry,material);
  floor.position.set(10,-50,z);
  app.scene.add(floor);
  geometry=new THREE.BoxGeometry(800,400,40);
  material=new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/wall1.jpg')} );
  var floor=new THREE.Mesh(geometry,material);
  floor.position.set(10,-50,-200);
  app.scene.add(floor);

  geometry=new THREE.BoxGeometry(40,400,800);
  material=new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/wall1.jpg')} );
  var floor=new THREE.Mesh(geometry,material);
  floor.position.set(-300,-50,-50);
  app.scene.add(floor);

  drawobstacles();

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function circleBoids()
{
    var boid=new THREE.ConeGeometry(2,2,5);
    var material=new THREE.MeshLambertMaterial({ color: 0x00ff00});

    for(i=0;i<NoOfBoids;i++)
      {

    sphere[i]=new THREE.Mesh(boid,material);
    sphere[i].mesh=sphere[i];
    sphere[i].position.set(getRandomInt(-75,-60),y-0.5,getRandomInt(-30,30));
    sphere[i].rotation.set(0,0,180);
    sphere[i].velocity=new THREE.Vector3();
    sphere[i].velocity.set(-VelX,0,-VelZ);
    time=new Date();
    app.scene.add(sphere[i]);

  }

}

function alignment(x)
{
  avelx=0,avelz=0;
  for(j=0;j<NoOfBoids;j++)
  {
    if(x!=j)
    {
      avelx=avelx+sphere[j].velocity.x;
      avelz=avelz+sphere[j].velocity.z;
    }
  }
  avelx=avelx/(NoOfBoids-1);
  avelz=avelz/(NoOfBoids-1);

  avelx=(avelx-sphere[x].velocity.x)/8;
  avelz=(avelz-sphere[x].velocity.z)/8;

}
function cohesion(x)
{
  cposx=0,cposz=0;

  for(j=0;j<NoOfBoids;j++)
  {
    if(j!=x)
    {
      cposx=cposx+sphere[j].position.x;
      cposz=cposz+sphere[j].position.z;
    }
  }
  cposx=cposx+(NoOfBoids)*75;

  cposx=cposx/(NoOfBoids-1);
  cposz=cposz/(NoOfBoids-1);

}
function separation(x)
{
  sposx=0,sposz=0;
  for(j=0;j<NoOfBoids;j++)
  {
    if(x!=j)
    {

      sposx=sphere[j].position.x-sphere[x].position.x;
      sposz=sphere[j].position.z-sphere[x].position.z;
      sdist=sposx*sposx+sposz*sposz;
      sdist=Math.sqrt(sdist);
    //  console.log(sdist);
      if(sdist<1)
      {
        sposx=sposx-5*(sphere[j].position.x-sphere[x].position.x);
        sposz=sposz-5*(sphere[j].position.z-sphere[x].position.z);
      }
    }
  }
}
 function velocitycheck(x)
 {
   if(Math.abs(sphere[i].velocity.x)>0.1)
   {
     avelx=-avelx;
     sphere[i].velocity.x=0;
   }
   if(Math.abs(sphere[i].velocity.z)>0.1)
   {
     avelz=-avelz;
     sphere[i].velocity.z=0;
   }
 }
 function obstacledetection(x)
 {  var dtocollide=0;
   for(j=0;j<objects.length;j++)
   {
     dx=sphere[x].position.x-objects[j].x-2.5;
     dz=sphere[x].position.z-objects[j].z-2.5;
     dtocollide=dx*dx+dz*dz;
     dtocollide=Math.sqrt(dtocollide);

     if(dtocollide<10)
     {
       if(sphere[x].position.z<=objects[j].z)
      sphere[x].position.z-=0.065;
      else       sphere[x].position.z+=0.065;

     }
   }

 }
function BoidMovement()
{
  for(i=0;i<NoOfBoids;i++)
  {
      cohesion(i);
      separation(i);
      alignment(i);
      obstacledetection(i);
      velocitycheck(i);
    sphere[i].velocity.x=sphere[i].velocity.x+cposx*0.001+avelx*0.0001+sposx*0.00005;
    sphere[i].velocity.z=sphere[i].velocity.z+cposz*0.000005+avelz*0.0001+sposz*0.00005;

    sphere[i].position.x=sphere[i].position.x+sphere[i].velocity.x;
    sphere[i].position.z=sphere[i].position.z+sphere[i].velocity.z;
   if(sphere[i].position.z<-37||sphere[i].position.z>37)
    {
      sphere[i].velocity.z=-sphere[i].velocity.z*2;

    }
    if(sphere[i].position.x<-75||sphere[i].position.x>75)
    {
      sphere[i].position.y-=0.5;

    }


  }
}
function animate() {
  //console.log("hello");

    requestAnimationFrame( animate );
    BoidMovement();
    var endtime=new Date();
    var td=(endtime-time);

    if(td>SpawnTime||sphere[0].position.y<-100)

          circleBoids();


  //  circleBoids();
    app.renderer.render( app.scene, app.camera );


  }


parseJson(function(){
  createscene();
  animate();
});
