var particleCount=10000;
var app={}
var particleGeometry,smokeGeometry;
var fp=["f4.jpg","f10.png","particle.png","p4.png","f5.jpg","f9.jpg"];
var sm=["s6.png","s5.png","s4.png","smoke.png","s7.png"];
var particleMaterial=[],smokeMaterial=[];
var p,newmesh=[];
var newflag=0;
var day=["bk.png","lf.png","rt.png","top.png"];
var night=["nightbk.png","leftnight.png","rightnight.png","topnight.png"];
var particleBase,smokeBase;
var SmokeMaterialShape=0;
var angle;
var firefliesGeometry;
var randomTargetFlag=0,randomTargetVector;
var flag=0;
var grassColor=new THREE.Color("rgb(0,255,0)"), grassHasRendered=0;
var constantGrassColor;
var sound;
var grassMaterial=[],mesh;
var FireMaterialShape=3;
var spreadFactor=0.001;
var spread=0.05;
var currentNoFireParticles=5000,currentNoSmokeParticles=1000;

//BOID VARIABLES
var cposx,cposz,cposy,NoOfBoids=300,sposx,sposy,sposz,randomTarget;
var wind=new THREE.Vector3(0,0,0);
var Controls=new function(){
  this.windX=0.0;
  this.windY=0.0;
  this.windZ=0.0;
  this.FireParticles=5000;
  this.SmokeParticles=1000;
  this.SpreadFactor=0.008;
  this.Audio=true;
  this.day=true;
}
var FireType=new function(){
  this.FireShape=1;
  this.FireSize=1;
  this.SmokeShape=1;
  this.SmokeSize=1;
}
init();
function init()
{
  app.scene=new THREE.Scene();
  app.scene.background=new THREE.Color(0x234567);
  app.camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,10000);
  app.camera.position.set(0,30,50);
  app.renderer=new THREE.WebGLRenderer();
  app.renderer.setSize(window.innerWidth,window.innerHeight);
  grassHasRendered=0;
  document.body.appendChild(app.renderer.domElement);
  addlights();

  addControls();
  getGUIControls();

  grassUpdate();
  particleSys();

  smokeParticleSystem();
  addSound();
  animate();
}
function addCig()
{
  var loader = new THREE.BufferGeometryLoader();
// load a resource
loader.load( 'js/cig.json', function ( geometry ) {
        var material = new THREE.MeshLambertMaterial( { size: 300,map: THREE.ImageUtils.loadTexture("images/images.jpeg") } );
        var mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(7,7,7);
        mesh.position.set(0,50,0);
          app.scene.add( mesh );
        })
}
function getGUIControls()
{
  var datGUI=new dat.GUI();
  datGUI.add(Controls, 'windY', -0.1, 0.1);
  datGUI.add(Controls,'windX',-0.1,0.1);
  datGUI.add(Controls,'windZ',-0.1,0.1);
   datGUI.add(Controls,'FireParticles',0,100000);
   datGUI.add(Controls,'SmokeParticles',0,100000);
   datGUI.add(Controls,'SpreadFactor',0,0.1);
   datGUI.add(Controls,'Audio');
   datGUI.add(Controls,'day');
   datGUI.add(FireType,'FireShape',0,5);
   datGUI.add(FireType,'FireSize',0.1,5);
   datGUI.add(FireType,'SmokeShape',0,5);
   datGUI.add(FireType,'SmokeSize',0.1,5);
}
function addSound()
{
  var listener=new THREE.AudioListener();
  app.camera.add(listener);
  sound=new THREE.Audio(listener);
  var audioLoader=new THREE.AudioLoader();
  audioLoader.load('sound/fireSound.ogg',function(buffer){
    sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 1 );
	sound.play();
});
}
function updateSound()
{
  if(currentNoFireParticles==0||currentNoSmokeParticles==0)
  {
    sound.stop();
  }
}
function addlights()
{
  var light2= new THREE.DirectionalLight(0xffffff,0.25);
 light2.position.set(10,10,5).normalize();
 light2.target.position.set(0,1,1);
 app.scene.add(light2);
 //
 var light3= new THREE.DirectionalLight(0xffffff,0.25);
 light3.position.set(0,10,10).normalize();
 light3.target.position.set(0,1,1);
 app.scene.add(light3);

 var light4= new THREE.DirectionalLight(0xffffff,0.25);
 light4.position.set(0,10,10).normalize();
 light4.target.position.set(1,1 ,0);
 app.scene.add(light4);
}
function addControls()
{
  app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);
  //app.camera.position.z = 20;
}
function randomFloat(min,max)
{
    return Math.random()*(max-min+1)+min;
}
function Night()
{
  var backGeometry=new THREE.BoxGeometry(125,80,1);
  var backMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+night[0])})
  var back=new THREE.Mesh(backGeometry,backMaterial);
  back.position.set(0,35,-50)
  app.scene.add(back);
  var leftGeometry=new THREE.BoxGeometry(1,80,100);
  var leftMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+night[1])})
  var left=new THREE.Mesh(leftGeometry,leftMaterial);
  left.position.set(-62.5,35,0);
  app.scene.add(left);
  var rightGeometry=new THREE.BoxGeometry(1,80,100);
  var rightMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+night[2])})
  var right=new THREE.Mesh(rightGeometry,rightMaterial);
  right.position.set(62.5,35,0);
  app.scene.add(right);
  var topGeometry=new THREE.BoxGeometry(125,1,100);
  var topMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+night[3])})
  var top=new THREE.Mesh(topGeometry,topMaterial);
  top.position.set(0,75,0);
  app.scene.add(top);
  fireflies();
}
function grassColorChange()
{
  for(i=0;i<18;i++)
  { if(newmesh[i])
    {
      if(Math.abs(newmesh[i].position.x)<spread&&Math.abs(newmesh[i].position.z)<spread)
      { grassColor.g-=0.0005;
        newmesh[i].material.color=grassColor;

      }

    }
  }
}
function Day()
{
  var backGeometry=new THREE.BoxGeometry(125,80,1);
  var backMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+day[0])})
  var back=new THREE.Mesh(backGeometry,backMaterial);
  back.position.set(0,35,-50)
  app.scene.add(back);
  var leftGeometry=new THREE.BoxGeometry(1,80,100);
  var leftMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+day[1])})
  var left=new THREE.Mesh(leftGeometry,leftMaterial);
  left.position.set(-62.5,35,0);
  app.scene.add(left);
  var rightGeometry=new THREE.BoxGeometry(1,80,100);
  var rightMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+day[2])})
  var right=new THREE.Mesh(rightGeometry,rightMaterial);
  right.position.set(62.5,35,0);
  app.scene.add(right);
  var topGeometry=new THREE.BoxGeometry(125,1,100);
  var topMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+day[3])})
  var top=new THREE.Mesh(topGeometry,topMaterial);
  top.position.set(0,75,0);
  app.scene.add(top);
}
function grassUpdate()
{
  var loader = new THREE.BufferGeometryLoader();
// load a resource
    constantGrassColor=grassColor;
loader.load( 'js/untitled.json', function ( geometry ) {
        for(i=0;i<18;i++)
        {
          grassMaterial[i] = new THREE.MeshLambertMaterial( { size: 1,color: grassColor, map: THREE.ImageUtils.loadTexture("images/grass.jpg") } );
        }
        mesh = new THREE.Mesh(geometry, grassMaterial);
        mesh.scale.set(7,7,7);
        mesh.position.set(-50,0,30);
          //app.scene.add( mesh );
        for(i=0;i<6;i++)
        {
          newmesh[i]=mesh.clone();
          newmesh[i].material=grassMaterial[i];
          newmesh[i].position.set(-50+(i)*20,0,-30);
          app.scene.add(newmesh[i]);
        }
        for(i=6;i<12;i++)
        {
          newmesh[i]=mesh.clone();
          newmesh[i].material=grassMaterial[i];
          newmesh[i].position.set(-50+(i-6)*20,0,0);
          app.scene.add(newmesh[i]);
        }
        for(i=12;i<18;i++)
        {
          newmesh[i]=mesh.clone();
          newmesh[i].material=grassMaterial[i];
          newmesh[i].position.set(-50+(i-12)*20,0,30);
          app.scene.add(newmesh[i]);
        }
      }
    )
        var groundGeometry=new THREE.BoxGeometry(125,1,100);
        var groundMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/dirt.png")})
        var ground=new THREE.Mesh(groundGeometry,groundMaterial);
        app.scene.add(ground);
        s=day;
        var backGeometry=new THREE.BoxGeometry(125,80,1);
        var backMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+s[0])})
        var back=new THREE.Mesh(backGeometry,backMaterial);
        back.position.set(0,35,-50)
        app.scene.add(back);
        var leftGeometry=new THREE.BoxGeometry(1,80,100);
        var leftMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+s[1])})
        var left=new THREE.Mesh(leftGeometry,leftMaterial);
        left.position.set(-62.5,35,0);
        app.scene.add(left);
        var rightGeometry=new THREE.BoxGeometry(1,80,100);
        var rightMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+s[2])})
        var right=new THREE.Mesh(rightGeometry,rightMaterial);
        right.position.set(62.5,35,0);
        app.scene.add(right);
        var topGeometry=new THREE.BoxGeometry(125,1,100);
        var topMaterial=new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/"+s[3])})
        var top=new THREE.Mesh(topGeometry,topMaterial);
        top.position.set(0,75,0);

        app.scene.add(top);
        grassHasRendered=1;

}
function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
function smokeParticleSystem()
 {

  smokeGeometry=new THREE.Geometry();
  for(i=0;i<5;i++)
  {
    smokeMaterial[i]=new THREE.PointsMaterial({size:FireType.SmokeSize,blending:THREE.SubtractiveBlending,transparent:true,map: THREE.ImageUtils.loadTexture("images/"+sm[i])});
    console.log(smokeMaterial[i]);
  }
  for(i=0;i<Controls.SmokeParticles;i++)
  {
    var smokeParticle=new THREE.Vector3();
    var smokeAngle=randomFloat(0,360);
    smokeParticle.x=randomFloat(0,3)*Math.cos(smokeAngle);
    smokeParticle.y=randomFloat(20,30);
    smokeParticle.z=randomFloat(0,3)*Math.sin(smokeAngle);

    smokeParticle.velocity=new THREE.Vector3(randomFloat(-5,5)/300,randomFloat(0,5)/50,randomFloat(-5,5)/300);
    smokeParticle.acceleration=new THREE.Vector3(randomFloat(-0.5,0.5)/10000,randomFloat(1,2)/10000,randomFloat(-1,1)/10000);
    smokeGeometry.vertices.push(smokeParticle);
  }

  smokeBase=new THREE.Points(smokeGeometry,smokeMaterial[SmokeMaterialShape]);
  smokeBase.sortParticles = true;
  app.scene.add(smokeBase);
}
function updateSmoke()
{
  for(i=0;i<Controls.SmokeParticles;i++)
  {
    var p=smokeGeometry.vertices[i];
    p.velocity.add(p.acceleration);
    p.x+=p.velocity.x+Controls.windX;
    p.y+=p.velocity.y;
    p.z+=p.velocity.z+Controls.windZ;
  //  smokeMaterial.opacity-=0.007;
  if(p.y>25&&p.y<27 )
  {
    p.velocity.x=-p.velocity.x;
    p.velocity.z=-p.velocity.z;
  }
    if(p.y>randomFloat(40,70))
    { //smokeMaterial.opacity=1;
      smokeAngle=randomFloat(0,360);
      p.y=randomFloat(20,30);
      p.x=randomFloat(-1-spread,1+spread)*Math.floor(Math.cos(smokeAngle));
      p.z=randomFloat(-1-spread,1+spread)*Math.floor(Math.cos(smokeAngle));
      p.velocity=new THREE.Vector3(randomFloat(-5,5)/300,randomFloat(0,5)/50,randomFloat(-5,5)/300);

    }
  }
    smokeBase.sortParticles = true;
  smokeGeometry.verticesNeedUpdate=true;
}
function particleSys()
{
    particleGeometry=new THREE.Geometry();
    for(i=0;i<6;i++)
    {
      particleMaterial[i]=new THREE.PointsMaterial({size:FireType.FireSize,color: 0xE29822,blending:THREE.AdditiveBlending,transparent:true,map: THREE.ImageUtils.loadTexture("images/"+fp[i%6])});
      console.log(particleMaterial[i]);
    }

    for(i=0;i<Controls.FireParticles;i++)
    {
      var particle=new THREE.Vector3();
      angle=randomFloat(0,360);
      particle.x=randomFloat(0,1)*Math.cos(angle);

      particle.y=0;
      particle.z=randomFloat(0,1)*Math.sin(angle);

      particle.velocity=new THREE.Vector3(randomFloat(-10,10)/100,randomFloat(0,5)/35,randomFloat(-10,10)/100);
      particle.acceleration=new THREE.Vector3(randomFloat(-1,1)/1000,randomFloat(1/20/500),randomFloat(-1,1)/1000);
      particle.alpha=1;
      particleGeometry.vertices.push(particle);


    }
    particleBase=new THREE.Points(particleGeometry,particleMaterial[FireMaterialShape]);//Math.floor(randomFloat(0,5))]);
    particleBase.sortParticles = true;
    app.scene.add(particleBase);


}
function FireAnimation()
{

  for(i=0;i<Controls.FireParticles;i++)
  {
    var p=particleGeometry.vertices[i];
    p.velocity.add(p.acceleration);
    p.x+=p.velocity.x+Controls.windX;
    p.y+=p.velocity.y;
    p.z+=p.velocity.z+Controls.windZ;
    particleMaterial.size-=0.1;
    var square=p.z*p.z+p.x*p.x;
      if(p.y>randomFloat(20,30)||(Math.abs(p.x)>(spread+100*Controls.windX)&&p.y<13)||(Math.abs(p.z)>(spread+100*Controls.wondZ)&&p.y<13)||(square>(3+spread)*(3+spread)))
    {
      p.y=0;
      angle=randomFloat(0,360);
      p.x=randomFloat(-1-spread,1+spread)*Math.floor(Math.cos(angle));
      p.z=randomFloat(-1-spread,1+spread)*Math.floor(Math.sin(angle));
      p.alpha=1;
      p.velocity=new THREE.Vector3(randomFloat(-5,5)/100,randomFloat(0,5)/35,randomFloat(-5,5)/100);
      var density=Controls.FireParticles/((1+spread)*(1+spread)*30);
      if(spread>60||(density<0.9))//&&Controls.windX==0&&Controls.WindZ==0))
      {
        Controls.SpreadFactor=0;
      }

      }
  }
  spread+=Controls.SpreadFactor;
    particleBase.sortParticles = true;
  particleGeometry.verticesNeedUpdate=true;
}
function restartFireAnimation()
{  grassColor.g=1;
  for(i=0;i<currentNoFireParticles;i++)
  {
    var p=particleGeometry.vertices[i];
    p.x=0;
    p.y=0;
    p.z=0;
    p.alpha=1;
  }
  particleGeometry.verticesNeedUpdate=true;
  spread=0.05;
  particleSys();
  restartSmokeAnimation();
}
function restartSmokeAnimation()
{
  for(i=0;i<currentNoSmokeParticles;i++)
  {
    var p=smokeGeometry.vertices[i];
    p.x=0;
    p.y=0;
    p.z=0;
  }
  smokeGeometry.verticesNeedUpdate=true;
  smokeParticleSystem();
}
function fireflies()
{
  firefliesGeometry=new THREE.Geometry();
  console.log("infireflies");
  firefliesMaterial=new THREE.PointsMaterial({size:1,blending:THREE.AdditiveBlending,transparent:true,map: THREE.ImageUtils.loadTexture("images/Butterfree.png")});
  for(i=0;i<300;i++)
  {
    var firefliesParticle=new THREE.Vector3();

    firefliesParticle.x=randomFloat(-65,65);
    firefliesParticle.y=randomFloat(0,70);
    firefliesParticle.z=randomFloat(-60,30);

    firefliesParticle.velocity=new THREE.Vector3(randomFloat(-5,5)/500,randomFloat(0,5)/500,randomFloat(-5,5)/500);
  //  smokeParticle.acceleration=new THREE.Vector3(randomFloat(-0.5,0.5)/10000,randomFloat(1,2)/10000,randomFloat(-1,1)/10000);
    firefliesGeometry.vertices.push(firefliesParticle);
  }
  firefliesBase=new THREE.Points(firefliesGeometry,firefliesMaterial);
  firefliesBase.sortParticles = true;
  app.scene.add(firefliesBase);
}
function cohesion(x)
{
  cposx=0,cposy=0,cposz=0;
  for(j=0;j<300;j++)
  {
    if(j!=x)
    {
      cposx=cposx+firefliesGeometry.vertices[j].x;
      cposy=cposy+firefliesGeometry.vertices[j].y;
      cposz=cposz+firefliesGeometry.vertices[j].z;
    }
  }
  //cposx=cposx+(NoOfBoids)*75;

  cposx=cposx/(NoOfBoids-1);
  cposy=cposy*0.01/(NoOfBoids-1);
  cposz=cposz/(NoOfBoids-1);
}
function separation(p)
{
  sposx=0,sposz=0,sposy=0;
  for(j=0;j<NoOfBoids;j++)
  {
    if(p!=j)
    {

      sposx=firefliesGeometry.vertices[j].x-firefliesGeometry.vertices[p].x;
      sposz=firefliesGeometry.vertices[j].z-firefliesGeometry.vertices[p].z;
      sposy=firefliesGeometry.vertices[j].y-firefliesGeometry.vertices[p].y;
      sdist=sposx*sposx+sposz*sposz+sposy*sposy;
      sdist=Math.sqrt(sdist);
    //  console.log(sdist);
      if(sdist<Math.floor(randomFloat(3,7)))
      {
        sposx=sposx-2*(firefliesGeometry.vertices[j].x-firefliesGeometry.vertices[p].x);
        sposz=sposz-2*(firefliesGeometry.vertices[j].z-firefliesGeometry.vertices[p].z);
        sposy=sposy-2*(firefliesGeometry.vertices[j].y-firefliesGeometry.vertices[p].y);
      }
    }
  }
}
function alignment(x)
{
  avelx=0,avelz=0,avely=0;
  for(j=0;j<NoOfBoids;j++)
  {
    if(x!=j)
    {
      avelx=avelx+firefliesGeometry.vertices[j].velocity.x;
      avelx=avelx+firefliesGeometry.vertices[j].velocity.y;
      avelz=avelz+firefliesGeometry.vertices[j].velocity.z;
    }
  }
  avelx=avelx/(NoOfBoids-1);
  avely=avely/(NoOfBoids-1);
  avelz=avelz/(NoOfBoids-1);

  avelx=(avelx-firefliesGeometry.vertices[x].velocity.x)/8;
  avely=(avely-firefliesGeometry.vertices[x].velocity.y)/8;
  avelz=(avelz-firefliesGeometry.vertices[x].velocity.z)/8;

}

function randomTarget()
{
  while(1)
  {
    var xTarget=randomFloat(-60,60);
    if(Math.abs(xTarget)>spread+1)
    {
      break;
    }
  }
  while(1)
  {
    var yTarget=randomFloat(5,60);
    if((yTarget)>50)
    {
      break;
    }
  }
  while(1)
  {
    var zTarget=randomFloat(-50,50);
    if(Math.abs(zTarget)>spread+1)
    {
      break;
    }
  }
   randomTargetVector=new THREE.Vector3(xTarget,yTarget,zTarget);
}
function tend_to_place(x)
{ if(randomTargetFlag==0)
  {
    randomTarget();
    console.log(randomTargetVector);
    randomTargetFlag=1;
  }
  firefliesGeometry.vertices[x].x+=(randomTargetVector.x-firefliesGeometry.vertices[x].x)/1000;
  firefliesGeometry.vertices[x].y+=(randomTargetVector.y-firefliesGeometry.vertices[x].y)/1000;
  firefliesGeometry.vertices[x].z+=(randomTargetVector.z-firefliesGeometry.vertices[x].z)/1000;
  var xdisp=firefliesGeometry.vertices[x].x-randomTargetVector.x;
  var ydisp=firefliesGeometry.vertices[x].y-randomTargetVector.y;
  var zdisp=firefliesGeometry.vertices[x].z-randomTargetVector.z;
  var sdistance=xdisp*xdisp+ydisp*ydisp+zdisp*zdisp;
  var sdistance=Math.sqrt(sdistance);
  if(Math.abs(firefliesGeometry.vertices[x].x)>60||Math.abs(firefliesGeometry.vertices[x].y)>70||Math.abs(firefliesGeometry.vertices[x].z)>60)
  {
    randomTargetFlag=0;
  }

}
function obstacleAvoidance(p)
{
  var dtocollide=0;
  dx=firefliesGeometry.vertices[p].x-spread-2.5;
  dz=firefliesGeometry.vertices[p].z-spread-2.5;
  dy=firefliesGeometry.vertices[p].y-50;
  dtocollide=dx*dx+dy*dy+dz*dz;
  dtocollide=Math.sqrt(dtocollide);
  if(dtocollide<10)
  {
    if(firefliesGeometry.vertices[p].z<=spread)
   firefliesGeometry.vertices[p].z-=0.065;
   else       firefliesGeometry.vertices[p].z+=0.065;
   if(firefliesGeometry.vertices[p].x<=spread)
  firefliesGeometry.vertices[p].x-=0.065;
  else       firefliesGeometry.vertices[p].x+=0.065;
  }
}
function tend_away_from_place(x)
{
  firefliesGeometry.vertices[x].x-=(0-firefliesGeometry.vertices[x].x)/10000;

  firefliesGeometry.vertices[x].y-=(0-firefliesGeometry.vertices[x].y)/10000;
  firefliesGeometry.vertices[x].z-=(0-firefliesGeometry.vertices[x].z)/10000;

}
function FirefliesUpdate()
{
  for(i=0;i<300;i++)
  {
    var p=firefliesGeometry.vertices[i];
    cohesion(i);
    separation(i);
    alignment(i);
    obstacleAvoidance(i);
    tend_away_from_place(i);
    tend_to_place(i);
  //  obstacledetection(i);
  //  console.log(cposx,cposy,cposz,i);
    p.x+=p.velocity.x+cposx*0.001+sposx*0.0008+avelx*0.0001;
    p.y+=p.velocity.y+cposy*0.001+sposy*0.0008+avelx*0.0001;
    p.z+=p.velocity.z+cposz*0.001+sposz*0.0008+avelx*0.0001;
    if(Math.abs(p.y)>70)
    {
      p.velocity.y=-p.velocity.y;
    }
    if(Math.abs(p.x)>60)
    {
      p.velocity.x=-p.velocity.x;
    }
    if(Math.abs(p.z)>60)
    {
      p.velocity.z=-p.velocity.z;
    }
  }
  firefliesBase.sortParticles = true;
firefliesGeometry.verticesNeedUpdate=true;
}
function restartFirefliesAnimation()
{
  for(i=0;i<300;i++)
  {
    var p=firefliesGeometry.vertices[i];
    p.x=0;
    p.y=0;
    p.z=0;
  }
  firefliesGeometry.verticesNeedUpdate=true;
  //fireflies();
}
function animate()
{   //  particleBase.rotation.y-=0.005;

    //grassMaterial.color.setHex(0x000000);
    if(Controls.FireParticles!=currentNoFireParticles)
    {
      restartFireAnimation();
      currentNoFireParticles=Controls.FireParticles;
      Controls.SmokeParticles=currentNoFireParticles;
    }
    if(Controls.SmokeParticles!=currentNoSmokeParticles)
    {
      restartSmokeAnimation();
      currentNoSmokeParticles=Controls.SmokeParticles;

    }
    FireAnimation();
    updateSmoke();
    updateSound();
    if(grassHasRendered==1)
    {
      grassColorChange();

    }
    if(Controls.Audio==false)
    {
      sound.pause();
      flag=1;
    }

    if(Controls.Audio==true&&flag==1)
    {
      sound.play();
      flag=0;
    }
    if(FireType.SmokeShape!=SmokeMaterialShape)
    {
      SmokeMaterialShape=Math.floor(FireType.SmokeShape);
      restartSmokeAnimation();
    }
    if(FireType.FireShape!=FireMaterialShape)
    {
      FireMaterialShape=Math.floor(FireType.FireShape);
      console.log(FireMaterialShape);
      restartFireAnimation();
    }
    if(Controls.day==false)
    {
      if(newflag==0)
      {
        Night();
        newflag=1;
      }
      FirefliesUpdate();

    }
    else if(Controls.day==true&&newflag==1){
      Day();
      restartFirefliesAnimation();
      newflag=0;
    }
    else if(Controls.day==false)
    {
      FirefliesUpdate();
    }
    requestAnimationFrame( animate );
    app.renderer.render( app.scene, app.camera );
}
