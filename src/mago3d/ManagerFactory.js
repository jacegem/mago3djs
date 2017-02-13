'use strict';

/**
 * Factory method 패턴을 사용해서 cesium, worldwind 등을 wrapping 해 주는 클래스
 * 
 * @param containerId 뷰에서 표시할 위치 id
 * @param magoConfig mago3d 설정값 json object
 * @return api
 */
var ManagerFactory = function(containerId, magoConfig) {
	if(!(this instanceof ManagerFactory)) {
		throw new Error(Messages.CONSTRUCT_ERROR);
	}
	
	var viewer = null;
	var manager = null;
	var magoManager = null;
	var scene = null;
	
	if(magoConfig.deployConfig === null 
			|| magoConfig.deployConfig === '' 
			|| magoConfig.deployConfig.viewLibrary === null 
			|| magoConfig.deployConfig.viewLibrary === '' 
			|| magoConfig.deployConfig.viewLibrary === 'cesium') {
		// 환경 설정
		MagoConfig.init(magoConfig);
		
		viewer = new Cesium.Viewer(containerId);
		viewer.scene.magoManager = new CesiumManager();
	} else if(viewLibrary === 'worldwind') {
		viewer = null;
	}
	
	draw();
	initEntity()
	viewer.zoomTo(viewer.entities);
	
	
	function draw() {
		if(magoConfig.deployConfig.viewLibrary === 'cesium') {
			drawCesium();
		} else if(magoConfig.deployConfig.viewLibrary === 'worldwind') {
			//
		}
	}
	
	function drawCesium() {
		
		var GL = viewer.scene.context._gl;
		viewer.scene.magoManager.selection.init(GL, viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight);
		viewer.scene.magoManager.shadersManager.createDefaultShader(GL); 
		viewer.scene.magoManager.postFxShadersManager.createDefaultShaders(GL); 
		viewer.scene.magoManager.scene = viewer.scene;
		
		// Start postRender version.***********************************************
		magoManager = viewer.scene.magoManager;
		scene = viewer.scene;
		//scene.copyGlobeDepth = true;
		
		viewer.scene.globe.depthTestAgainstTerrain = true;
		
		magoManager.selection.init(GL, scene.drawingBufferWidth, scene.drawingBufferHeight);
		magoManager.shadersManager.createDefaultShader(GL); 
		magoManager.postFxShadersManager.createDefaultShaders(GL); 
		
		var readerWriter = new ReaderWriter();
		
		// 실제 빌딩을 읽어 들임
		magoManager.loadData(magoConfig.geoConfig.initBuilding);
		
//		var bRBuildingProjectsList = magoManager.bRBuildingProjectsList;
		var neoBuildingsList = magoManager.neoBuildingsList;
		
		magoManager.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
		addMouseAction();

		
		//getEntity()
		//viewer.zoomTo(viewer.entities);

	}
	
	// handlers.**************************************************************************
	function disableCameraMotion(state){
		viewer.scene.screenSpaceCameraController.enableRotate = state;
		viewer.scene.screenSpaceCameraController.enableZoom = state;
		viewer.scene.screenSpaceCameraController.enableLook = state;
		viewer.scene.screenSpaceCameraController.enableTilt = state;
		viewer.scene.screenSpaceCameraController.enableTranslate = state;
	}
	
	function addMouseAction() {
		magoManager.handler.setInputAction(function(click) {
			magoManager.dateSC = new Date();
			magoManager.startTimeSC = magoManager.dateSC.getTime();
			//secondsUsed = this.currentTimeSC - this.startTimeSC;
					
			magoManager.mouse_x = click.position.x;
			magoManager.mouse_y = click.position.y;
			magoManager.mouseLeftDown = true;
			
			var hola = 0;
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		magoManager.handler.setInputAction(function(movement) {
			if(magoManager.mouseLeftDown) {
				if(movement.startPosition.x != movement.endPosition.x || movement.startPosition.y != movement.endPosition.y) {
					if(magoManager.objectSelected != undefined) {
						// move the selected object.***
						magoManager.mouse_x = movement.startPosition.x;
						magoManager.mouse_y = movement.startPosition.y;
						
						// 1rst, check if there are objects to move.***
						if(magoManager.mustCheckIfDragging) {
							var gl = scene.context._gl;
							if(magoManager.isDragging(gl, scene)) {
								magoManager.mouseDragging = true;
								disableCameraMotion(false);
							}
							magoManager.mustCheckIfDragging = false;
						}
					} else {
						magoManager.isCameraMoving = true; // if no object is selected.***
					}	
						
					if(magoManager.mouseDragging) {
						var gl = scene.context._gl;
						magoManager.moveSelectedObject(gl, scene, magoManager.currentRenderables_neoRefLists_array);
					}
				}
			} else{
				magoManager.mouseDragging = false;
				disableCameraMotion(true);
			}
			
			}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		magoManager.handler.setInputAction(function(movement) {
			// if picked
			//vm.pickedPolygon = false;
			//disableCameraMotion(true)
			magoManager.isCameraMoving = false;
			magoManager.mouseLeftDown = false;
			magoManager.mouseDragging = false;
			magoManager.selObjMovePlane = undefined;
			magoManager.mustCheckIfDragging = true;
			magoManager.thereAreStartMovePoint = false;
			disableCameraMotion(true);
			
			magoManager.dateSC = new Date();
			magoManager.currentTimeSC = magoManager.dateSC.getTime();
			var miliSecondsUsed = magoManager.currentTimeSC - magoManager.startTimeSC;
			if(miliSecondsUsed < 500) {
				if(magoManager.mouse_x == movement.position.x && magoManager.mouse_y == movement.position.y) {
					magoManager.bPicking = true;
					//var gl = scene.context._gl;
					//f4d_topManager.objectSelected = f4d_topManager.getSelectedObjectPicking(gl, scene, f4d_topManager.currentRenderables_neoRefLists_array);
				}
			}
			
			var hola = 0;
	    }, Cesium.ScreenSpaceEventType.LEFT_UP);
	}
	
	function drawWorldWind() {
	}
	
	/**
	 * zoomTo 할 Entity
	 * @returns entities
	 */
	function initEntity() {
		return viewer.entities.add({

				/*
			name : magoConfig.geoConfig.initEntity.name,
			polygon : {
				hierarchy : Cesium.Cartesian3.fromDegreesArray(magoConfig.geoConfig.initEntity.longitudeAndLatitude),
				height : magoConfig.geoConfig.initEntity.height,
				*/

			name : 'Blue box',
			position: Cesium.Cartesian3.fromDegrees(126.92734533517019, 37.517207695444, 1500.0),
			box : {
				dimensions : new Cesium.Cartesian3(300000.0*1000.0, 300000.0*1000.0, 300000.0*1000.0), // dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
				//material : Cesium.Color.TRANSPARENT

				fill : false,
			    material : Cesium.Color.TRANSPARENT,
			    outline : true,
			    outlineWidth : 3.0,
			    outlineColor : Cesium.Color.BLACK
			}
//				name : 'Blue box',
//	            position: new Cesium.Cartesian3(1.0, 1.0, 1.0), // usa = (-114.0, 40.0, 300000.0), songdo = (126.6554, 37.3853, 300000.0)
//	            box : {
//	                dimensions : new Cesium.Cartesian3(300000.0*1000000, 300000.0*1000000, 300000.0*1000000), // dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
//	                material : Cesium.Color.BLUE
//	            }
		});
	}
	
	return {
		drawAPI : function() {
			draw();
		},
		highlightAPI : function(type) {
			
		}
	};
}
