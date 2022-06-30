
import utils from '/k1/libK1_Utils.js'
import sess  from '/k1/libK1_Sesion.js'
import ajax  from '/k1/libK1_Ajax.js'
import topol from '/k1/libK1_Topol.js'

import {vgApp,goPag} from '/js/stoks_VGlob.js'


function montaTablaMalla(taula,editON){
	var t = utils.vgk.topol;
	var cap = utils.rEl$('thead');
	var cos = utils.rEl$('tbody');
	taula.appendChild(cap);
	taula.appendChild(cos);

	var nrows = t.getNodosRow();
	var ncols = t.getNodosCol();
	var arcos = t.getArcos();
	var arcIds = [];
	arcos.map(function(arc){
		var idArc = ''+arc.ixI+':'+arc.ixF;
		arcIds.push(idArc);
	})

	var trh = utils.rEl$('tr');
	var th0 = utils.rEl$('th');
	trh.appendChild(th0);
	ncols.map(function(nodo){
		var thx = utils.rEl$('th');
		thx.innerHTML = nodo.tag;
		trh.appendChild(thx);
		})
	cap.appendChild(trh);

	var trCount = 0;
	nrows.map(function(nodo){
		var trb = utils.rEl$('tr');
		var td0 = utils.rEl$('td');
		td0.innerHTML = nodo.tag;
		trb.appendChild(td0);


		for (var i=0;i<ncols.length;i++){
			var tdx = utils.rEl$('td');
			tdx.id = ''+trCount+':'+i;
			var arcIx = arcIds.indexOf(tdx.id);
			if (arcIx > -1)tdx.innerHTML= arcos[arcIx].tag;
			if (editON){
				tdx.onclick = function(ev){
					utils.r$('tag').value = tdx.innerHTML || 'x';
					utils.r$('id0').value = ev.target.id;
					utils.r$('rol').value = 'ARCO';
					}
				}

			trb.appendChild(tdx);
			}
		cos.appendChild(trb);
		trCount++;
	})

}

function showStoks(){
	if (!utils.vgk.topol) return;
	var divShow = utils.r$('show');
	divShow.innerHTML = null;
	var taula = utils.rEl$('table');
	montaTablaMalla(taula,false);
	utils.r$('show').appendChild(taula);
}

function editStoks(){
	if (!utils.vgk.topol) return;
	var divShow = utils.r$('show');
	divShow.innerHTML = null;
	var t = utils.vgk.topol;

	var taula = utils.rEl$('table');
	montaTablaMalla(taula,true);
	utils.r$('show').appendChild(taula);
	var frmEdit = utils.r$('frmEdit');
	frmEdit.reset();
	frmEdit.style.display= 'block';

}

function updtStoks(){
	if (!utils.vgk.topol||!utils.vgk.topolId) return;
	var t = utils.vgk.topol;
	var _id = utils.vgk.topolId;
	ajax.updateTopol(t,_id);
}


function editAction(acc){
	var t = utils.vgk.topol;
	var tag = utils.r$('tag').value;
	var id0 = utils.r$('id0').value;
	var rol = utils.r$('rol').value;

	switch(acc){
		case 'GRABA':
			if (rol == 'NODO' && id0){
				var nodo = t.getNodoById(id0);
				t.updtNodoSelf(nodo);
			}
			else if (rol == 'ARCO' && id0){
				console.log(tag,id0,rol);
				var ixs = id0.split(':');
				var ixI = parseInt(ixs[0]);
				var ixF = parseInt(ixs[1]);
				var arco = t.getArcoByIxs(ixI,ixF);
				arco.tag = tag;
				t.updtArcoSelf(arco); 
			}
			break;
		case 'BORRA':
			if (rol == 'NODO' && id0){
				var nodo = t.getNodoById(id0);
				t.borraNodo(nodo);
			}
			break;
		case 'SUBE':
			if (rol == 'NODO' && id0){
				var nodo = t.getNodoById(id0);
				t.subeNodo(nodo);
			}
			break;
		case 'BAJA':
			if (rol == 'NODO' && id0){
				var nodo = t.getNodoById(id0);
				t.bajaNodo(nodo);
			}
			break;
		case '+NODO':
			var tag = utils.r$('tag').value;
			var nodo = new topol.rNodo(tag ||'Nuevo');
			t.addNodoSelf(nodo);
			break;
		case '+HIJO':
			if (utils.vgk.topol_t != 'ARBOL') return;
			var padre = t.getNodoById(id0);
			var tag = utils.r$('tag').value;
			var hijo = new topol.rNodo(tag ||'Nuevo');
			t.addNodoHijo(padre,hijo);
			break;
		case '+ARCO':
			console.log(id0);
				var tag = utils.r$('tag').value;
				var ixs = id0.split(':');
				var ixI = parseInt(ixs[0]);
				var ixF = parseInt(ixs[1]);
				var nodoI = t.getRowByIx(ixI);
				var nodoF = t.getColByIx(ixF);
				var arco = new topol.rArco(tag || 'x',nodoI.id0,nodoF.id0);
				console.log('Arco:',utils.o2s(arco));
				t.addArcoSelf(arco);
			break;
		case '+ROW':
			var tag = utils.r$('tag').value;
			var nodo = new topol.rNodo(tag ||'Nuevo');
			nodo.rol = 'NROW';
			t.addNodoSelf(nodo);
			break;
		case '+COL':
			var tag = utils.r$('tag').value;
			var nodo = new topol.rNodo(tag ||'Nuevo');
			nodo.rol = 'NCOL';
			t.addNodoSelf(nodo);
			break;

	}
	utils.r$('frmEdit').style.display= 'none';
	showStoks();
}


function ecoCargaStoks(objDB){
	utils.vgk.topolId = objDB._id;
	var iam = objDB.meta.iam;

	switch(iam){
		case 'rMalla':
			var t = new topol.rMalla('',[]);
			t.objDB2Clase(objDB);
			utils.vgk.topol = t;
			showStoks();
			break;
			default : alert('No hay Stoks');
	}

}

function cargaStoks(_id){
	console.log('cargaStoks',_id)
	ajax.getTopol(_id,ecoCargaStoks);
}


function ecoListaStoks(objs){
	var form = utils.r$('lista');
	form.innerHTML = null;

	var select = document.createElement('select');
	select.onclick = function(){cargaStoks(select.value);};

	objs.map(function(obj,ix){
		var opt = document.createElement('option');
		opt.value = obj._id;
		opt.text = obj.meta.tag;
		select.appendChild(opt);
	})
	form.appendChild(select);
}




function listaStoks(tipo){

	switch (tipo){
		case 'MALLA' :
			ajax.listaTopols('rMalla',ecoListaStoks);
			break;
	}
}


function showTodo(){
	console.log('OK');
	listaStoks('MALLA');
}

function creaStoks(){
	var t ={};
	var tag = prompt('Tag?');
	if (!tag) return null;
	t = new topol.rMalla(tag,[]);
	utils.vgk.topol = t;
	showStoks();
//	grabaStoks();
	ajax.grabaTopol(utils.vgk.topol);

}

function initStoks(){
	utils.vgk.user = {'org':'DEMO01','keo':''};
}


window.onload = initStoks;
window.showTodo = showTodo;
window.creaStoks = creaStoks;
window.editStoks  = editStoks;
window.editAction = editAction;
window.updtStoks = updtStoks;
window.vgApp = vgApp;