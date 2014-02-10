/********************************************************************
Online plotter:   http://fooplot.com/
Personal website: http://dheera.net/

--------------------- DO NOT REMOVE THIS NOTICE ---------------------
FooPlot embeddable plotter v2.0
Copyright (C) 2012 Dheera Venkatraman <dheera@dheera.net>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
---------------------------------------------------------------------

This code is in BETA; some features are incomplete and the code
could be written better. If you are only intending to embed a single
plot into your webpage, it is suggested to use the 'Get Embed Code'
feature on www.fooplot.com to get an IFRAME-based plotter that is
hotlinked to the latest version of this code.

********************************************************************/

function FooplotSVGRecorder() {
  // drop-in replacement for certain features of the relevant features
  // of canvas, so that we can record an svg version for generating
  // other formats
  this.width=null;
  this.height=null;
  this.font='';
  this.textAlign='';
  this.svgHeader='';
  this.svgBody='';
  this.svgFooter='';
  this.lineWidth=1;
  this.strokeStyle='#000000';
  this.fillStyle='#ffffff';
  this.x=0;
  this.y=0;
  this.path_d='';
  this.moveToX=null;
  this.moveToY=null;
  this.clear=function() {
    this.svgBody='';
  }
  this.fillText=function(_text,_x,_y) {
    var _textAnchor='start';
    if(this.textAlign=='center') _textAnchor='middle';
    if(this.textAlign=='right') _textAnchor='end';
    this.svgBody+='<text x="'+_x+'" y="'+_y+'" text-anchor="'+_textAnchor+'" style="font:'+this.font+';stroke:none;fill:'+this.fillStyle+'">'+_text+'</text>';
  }
  this.beginPath=function() {
    this.path_d='';
  }
  this.moveTo=function(_x,_y) {
    if(!isNaN(_x) && !isNaN(_y)) {
      this.moveToX=_x.toFixed(2);
      this.moveToY=_y.toFixed(2);
    }
  }
  this.lineTo=function(_x,_y) {
    if(this.moveToX) {
      this.path_d+='M'+this.moveToX+' '+this.moveToY+' ';
      this.moveToX=null;
      this.moveToY=null;
    }
    this.path_d+='L'+_x.toFixed(2)+' '+_y.toFixed(2)+' ';
  }
  this.stroke=function() {
    this.svgBody+='<path d="'+this.path_d+'" style="fill:none;stroke:'+this.strokeStyle+';stroke-width:'+this.lineWidth+';" />';
    this.path_d='';
  }
  this.fillRect=function(_x,_y,_w,_h) {
    this.svgBody+='<rect x="'+_x.toFixed(2)+'" y="'+_y.toFixed(2)+'" width="'+_w.toFixed(2)+'" height="'+_h.toFixed(2)+'" style="fill:'+this.fillStyle+';stroke:none;" />';
  }
  this.getSVG=function() {
    var _svg='';
    _svg+='<?xml version="1.0" standalone="no"?>';
    _svg+='<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    _svg+='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+this.width+' '+this.height+'" version="1.1">';
    _svg+='<clipPath id="box"><rect x="0" y="0" width="'+this.width+'" height="'+this.height+'" style="fill:none;stroke:none;" /></clipPath>';
    _svg+='<g clip-path="url(#box)">';
    _svg+=this.svgBody;
    _svg+='</g></svg>';
    return _svg;
  }
}

function Fooplot(container,options) {

  // PRIVATE: INITIALISATION AND BASIC FUNCTIONS

  FOOPLOT_INSTANCES.push(this);

  this.container=container;
  this.container.style.overflow='hidden';
  this.container.style.position='relative';
  this.container.style.webkitUserSelect='none';
  this.container.style.MozUserSelect='none';
  this.container.style.userSelect='none';
  if(FOOPLOT_MSIE) this.container.unselectable=true;
  this.container.style.cursor='move';

  this.cover=document.createElement('div');
  this.cover.style.position='absolute';
  this.cover.style.width='100%';
  this.cover.style.height='100%';
  this.container.style.webkitUserSelect='none';
  this.container.style.MozUserSelect='none';
  if(FOOPLOT_MSIE) this.cover.unselectable=true;
  this.cover.style.zIndex=100;
  this.cover.style.background='#ffffff';
  this.cover.style.filter='alpha(opacity=0)';
  this.cover.style.opacity=0;
  this.container.appendChild(this.cover);

  this.subcontainer=document.createElement('div');
  this.subcontainer.style.position='absolute';
  this.subcontainer.style.zIndex='1';
  this.subcontainer.style.webkitUserSelect='none';
  this.subcontainer.style.userSelect='none';
  if(FOOPLOT_MSIE) this.subcontainer.unselectable=true;
  this.container.appendChild(this.subcontainer);

  this.recorder=new FooplotSVGRecorder();

  this.toolcontainer=document.createElement('div');
  this.toolcontainer.style.position='absolute';
  this.toolcontainer.style.top='100%';
  this.toolcontainer.style.zIndex='200';
  this.toolcontainer.style.opacity=0.7;
  this.toolcontainer.style.marginTop='-60px';
  this.toolcontainer.style.marginLeft='10px';
  this.toolcontainer.style.padding='10px';
  this.toolcontainer.style.height='32px';
  this.toolcontainer.style.webkitBorderRadius='5px';
  this.toolcontainer.style.visibility='hidden';
  this.container.appendChild(this.toolcontainer);


  this.addToolSeparator=function() {
    var newtool=document.createElement('div');
    newtool.style.display='inline';
    newtool.style.width='32px';
    newtool.style.height='1px';
    newtool.style.border='0px';
    newtool.style.padding='0px';
    newtool.style.marginRight='15px';
    this.toolcontainer.appendChild(newtool);
  }

  this.addToolButton=function(image,action,modeId,tooltip) {
    var newtool=document.createElement('button');
    newtool.className='fooplot-tool';
    newtool.style.width='32px';
    if(tooltip) newtool.title=tooltip;
    newtool.style.background=image;
    newtool.style.position='relative';
    newtool.style.height='32px';
    newtool.style.border='0px';
    newtool.style.padding='0px';
    newtool.style.marginRight='15px';
    newtool.style.cursor='pointer';
    if(!modeId) {
      newtool.onmousedown=function() {this.style.opacity=0.7;this.style.filter='alpha(opacity=70)';}
      newtool.onmouseup=function() {this.style.opacity=1;this.style.filter='';}
      newtool.onmouseout=function() {this.style.opacity=1;this.style.filter='';}
      newtool.onclick=action;
    } else {
      newtool.onclick=function() {
        for (i in FOOPLOT_INSTANCES) if(this.parentNode==FOOPLOT_INSTANCES[i].toolcontainer) var _self=FOOPLOT_INSTANCES[i];
        _self.selectMode(this);
      }
      this.toolsMode.push({'tool':newtool,'id':modeId});
    }
    this.toolcontainer.appendChild(newtool);
    return newtool;
  }

  this.hideIntersection=function() {
    this.intersectionPoint.style.visibility='hidden';
    this.intersectionDisplay.style.visibility='hidden';
  }

  this.hideTrace=function() {
    this.tracePoint.style.visibility='hidden';
    this.traceDisplay.style.visibility='hidden';
  }

  this.toolsMode=[];
  this.selectedMode=FOOPLOT_MODE_MOVE;
  this.selectMode=function(obj) {
    this.hideIntersection();
    this.hideTrace();
    for (i in this.toolsMode) {
      if(this.toolsMode[i].tool==obj || this.toolsMode[i].id==obj) {
        this.selectedMode=this.toolsMode[i].id;
        this.toolsMode[i].tool.style.opacity=0.7;
        this.toolsMode[i].tool.style.filter='alpha(opacity=70)';
      } else {
        this.toolsMode[i].tool.style.opacity=1;
        this.toolsMode[i].tool.style.filter='';
      }
    }
  }

  this.zoomTimeout=null;
  this.zoomSelf=null;
  this.zoomPendingFactor=1;

  this.zoom=function(factor) {
    if(this.zoomTimeout) window.clearTimeout(this.zoomTimeout);
    if(FOOPLOT_TRANSITIONS && this.canvas && this.canvas.style && factor!=1) {
        this.canvas.style.OTransition='-o-transform 0.4s ease';
        this.canvas.style.webkitTransition='-webkit-transform 0.4s ease';
        this.canvas.style.MozTransition='-moz-transform 0.4s ease';
        this.canvas.style.msTransition='-webkit-transform 0.4s ease';
        this.canvas.style.webkitTransform+='scale('+factor+')';
        this.canvas.style.MozTransform+='scale('+factor+')';
        this.canvas.style.msTransform+='scale('+factor+')';
        this.canvas.style.OTransform+='scale('+factor+')';
      }
      this.hideIntersection();
      this.hideTrace();
      this.zoomSelf=this;
      this.zoomPendingFactor*=factor;
      this.zoomTimeout=window.setTimeout(function(_self) {
        if(!_self) for (i in FOOPLOT_INSTANCES) if(FOOPLOT_INSTANCES[i].zoomSelf) var _self=FOOPLOT_INSTANCES[i].zoomSelf;
        var centerx=(_self.xmax+_self.xmin)/2;
        var centery=(_self.ymax+_self.ymin)/2;
        _self.xmax=(_self.xmax-centerx)/_self.zoomPendingFactor+centerx;
        _self.xmin=(_self.xmin-centerx)/_self.zoomPendingFactor+centerx;
        _self.ymax=(_self.ymax-centery)/_self.zoomPendingFactor+centery;
        _self.ymin=(_self.ymin-centery)/_self.zoomPendingFactor+centery;
        _self.zoomPendingFactor=1;
        _self.reDraw();
        _self.canvas.style.OTransition='color 0 ease'; // opera hack
        _self.canvas.style.webkitTransition='';
        _self.canvas.style.MozTransition='';
        _self.canvas.style.msTransition='';
        _self.canvas.style.webkitTransform='';
        _self.canvas.style.MozTransform='';
        _self.canvas.style.msTransform+='';
        _self.canvas.style.OTransform='';
        _self.onWindowChange([_self.xmin,_self.xmax,_self.ymin,_self.ymax]);
        _self.zoomTimeout=null;
        _self.zoomSelf=null;
      },FOOPLOT_TRANSITIONS?450:0,this);
  }

  this.toolZoomIn=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAPZRAP9/AP+AAP+AAf+AAv+BA/+BBP+DB/+GDf+GDv+HD/+KFv+LGP+MGv+OHf+PH/+QIv+UKf+UKv+YMv+aNv+bN/+gQf+iRf+jSP+kSf+nUP+oUv+pU/+pVP+qVv+sWf+wYf+xY/+2bv+5c/+8ev+9fP+/gP/Bg//Chv/Eiv/Gjf/HkP/Jk//Ll//Mmf/Onv/Qof/Ysv/bt//cuf/cuv/du//evf/evv/gwf/gwv/hw//jx//kyv/mzf/nz//s2v/v3//v4P/w4f/w4v/x4//y5v/06v/27f/48f/59P/69v/79//7+P/8+f/8+v/9+//+/f/+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFIALAAAAAAgACAAAAf+gFJSAAEAhoeIiYqJglKFi5CRhwGDkpaSj5eak5oGDJuaFio6SFFGMycQoIoJLlGvsK9IIpmgFECxua85CqsJQ7lAP0S5MKsvuUuGFLofmxi6ygDMuUe9ly3Ry7pRHpo8uk3buimXBk2vNQnrCYYG7AmlUTmXD7AytYpLr0OXAfIyDAg0YCjAQAPyYmjKoW0atxOaVDSklguDJgnoYkmjCAtIO00lko2LVQGUAXCxePTwoUvDqgY1uIVzCSpACHm5hoyQ16TDKgAOQLDYUaQGig7tMOyL0oTmT0hKX/V8GgkDT1VUF0UtkbUqCUX5uiIKKxaRo7KJKAkihLaQoEAAOw==\')',
    function() {
      for (i in FOOPLOT_INSTANCES) if(this.parentNode==FOOPLOT_INSTANCES[i].toolcontainer) var _self=FOOPLOT_INSTANCES[i];
      _self.zoom(2);
    },
    null,
    'Zoom In'
  );

  this.toolZoomOut=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAPZLAP9/AP+AAP+AAf+AAv+BBP+DB/+GDf+GDv+HD/+KFv+LF/+LGP+MGv+OHf+PH/+QIv+UKf+UKv+YMv+bN/+gQf+iRf+jSP+kSf+nUP+oUv+pU/+pVP+qVv+rWP+sWf+wYf+xY/+zZ/+2bv+5c/+8ev+9fP+/gP/Bg//Chv/Eiv/Gjf/HkP/Jk//Ll//Mmf/Onv/Qof/Ysv/bt//cuv/evf/evv/gwf/gwv/hw//jx//kyv/mzf/v4P/w4f/w4v/x4//06v/27f/48f/59P/69v/79//7+P/8+v/9+//+/f/+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEwALAAAAAAgACAAAAfXgExMAAEAhoeIiYqJgkyFi5CRhwGDkpaSj5eak5oFDJuaFSw5Q0tBMygQoIoIL0uvsK9DI5mgEzyxua84CqsIP7rBMaswwcYfmxfGxkILmi7Lxh2aO9HBKpcFR7khCt7exbE2lw+604gtuT+XAaWx54fpsTKaOda6KJoq97kXmhL8YPFAsKlEwCUUQBWoxi/DqgY1+B1xCCqACHfqSLg7wmEVgAcfWugAUiMFB4IXjLya6FFSypUdW0K6sFGVzEUvTdyMdKHEzlW1fipyJDQRJUFFDRUSFAgAOw==\')',
    function() {
      for (i in FOOPLOT_INSTANCES) if(this.parentNode==FOOPLOT_INSTANCES[i].toolcontainer) var _self=FOOPLOT_INSTANCES[i];
      _self.zoom(0.5);
    },
    null,
    'Zoom Out'
  );

  this.addToolSeparator();

  this.toolMove=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAPY/AP9/AP+AAP+AAf+AAv+BBP+CBf+FDP+GDv+HD/+IEf+IEv+JE/+KFv+MGv+NG/+OHf+PH/+PIP+QIf+QIv+TKP+UKf+bOP+dPP+fQP+jSP+oUv+pVP+rWP+uXf+xY/+1a/+3cP+6dv+7d/+7eP+8ef+9e/++ff/Dh//DiP/Hj//Ikv/Klf/Ll//LmP/NnP/Pn//du//fv//hw//ixv/kyv/lzP/mzv/o0f/o0v/p1P/t2//u3v/v4P/w4f/+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEAALAAAAAAgACAAAAf0gEBAAAEAhoeIiYqHhYJAhYuRkoyDk4mQloaYlhw5D5mEoAAjPz87E6KWBC6lpaepkQgwra09qLCJDhYWIKUiGhsXuJEZpRbDk8U/x8jExs0TwonKzIgUm4sRPBuK1IogLJMPOz8a3c+JvSiRDjq+u/C8pR7xuymlJIoBOLT9/v+lPijqALDgPxmLTPjKwLAhqR8gGjZsUYoGgkisMJxb9u2HjQWRAhCAoXEaOkQgcICchCDCxmqHMjBo5q3Zopo2TXLMaSgDCHClWIwYUSEngxv+VGAbpsAGrXU8DSGYgU/U0kUIYoCIqg/WI66UBIXi2QhIIAA7\')',
    null,FOOPLOT_MODE_MOVE,'Move');

  this.toolZoomBox=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAPYAAP9/AP+AAP+AAf+AAv+BA/+BBP+CBf+DB/+GDf+GDv+HD/+KFv+LGP+MGv+OHf+PH/+QIv+TJ/+UKf+UKv+YMv+bN/+gQf+iRf+jSP+kSf+nT/+nUP+oUv+pU/+pVP+qVv+sWf+uXv+wYf+xY/+1a/+2bv+3b/+5c/+8ev+9fP+/gP/Bg//Chv/Eiv/Gjf/Hj//HkP/Jk//JlP/Ll//Mmf/Onv/Qof/Xr//Ysv/bt//cuv/evf/evv/gwf/gwv/hw//jx//kyv/mzf/r1//v4P/w4f/w4v/x4//06v/27f/48f/59P/69v/79//7+P/8+v/9+//9/P/+/f/+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFUALAAAAAAgACAAAAf+gFVVAAEAhoeIiYqHhYJVhYuRkoyDk5aTkJeajJoHDZuaFzFAS1RJOiwSoIoKNVSvsK9LJ5mgFUSxua8/C6sKR09LT03CS07Gx1Q4qzZUGoaQAdKHL1Qimxmvz4qZ1Uq9lzTahgfl5geG1VQfmkLjADe5JumvL5cHT+/xsfMA6j+XIMDatg9WP3VELgUo5cxQwVcHX+nQ5OPdjCEYMYagR2WFJnXbJIHUROGdSCpEFGxKQYVEhJcwY0ZoZgHUAXe6cnJY5WBHTl1Pdq4ywTAXERQMg64C8GDEjCBIdrT4oDKDk1dP2C2VZBWr0K2Lur5SBXYRhqsqykrCkELtqloObhU9ipsogCO60AAICgQAOw==\')',
    null,FOOPLOT_MODE_ZOOMBOX,'Zoom Box');

  this.toolTrace=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAMYAAP9/AP+AAP+AAf+AAv+BBP+CBf+FDP+GDv+HD/+IEf+IEv+JE/+KFv+MGv+NG/+OHf+PH/+PIP+QIf+QIv+TKP+UKf+bOP+dPP+fQP+jSP+oUv+pVP+rWP+uXf+xY/+1a/+3cP+6dv+7d/+7eP+8ef+9e/++ff/Dh//DiP/Hj//Ikv/Klf/Ll//LmP/NnP/Pn//du//fv//hw//ixv/kyv/lzP/mzv/o0f/o0v/p1P/t2//u3v/v4P/w4f/+/v////9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/ACH5BAEAAD4ALAAAAAAgACAAAAdfgD4+AAEAhoeIiYqHhYI+hYuRkoyDk5aTkJeajJudnp+goaKjpKWmp6iJP6urqD+qr6SxirOgtbSsnre4rZu7vL+jrL2ph8GmxMUAw8rNzs/Q0YqZ0qePxQGOhKaNPoEAOw==\')',
    null,FOOPLOT_MODE_TRACE,'Trace');

  this.toolIntersection=this.addToolButton(
    'url(\'data:image/gif;base64,R0lGODlhIAAgAMYAAP9/AP+AAP+AAf+AAv+BBP+CBf+FDP+GDv+HD/+IEf+IEv+JE/+KFv+MGv+NG/+OHf+PH/+PIP+QIf+QIv+TKP+UKf+bOP+dPP+fQP+jSP+oUv+pVP+rWP+uXf+xY/+1a/+3cP+6dv+7d/+7eP+8ef+9e/++ff/Dh//DiP/Hj//Ikv/Klf/Ll//LmP/NnP/Pn//du//fv//hw//ixv/kyv/lzP/mzv/o0f/o0v/p1P/t2//u3v/v4P/w4f/+/v////9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/AP9/ACH5BAEAAD4ALAAAAAAgACAAAAdygD4+AAEAhoeIiYqHhYI+hYuRkoyDk5aTkJeajJuRP52gn6CaP6Kjlqank6mqi6ytiq+opaWeo6yyspK5ibq7trS+tp7BsLHFxojBwqe0yb2HzJ24z7ywvrXNl9mb0tHe3rfP44uZ5OeLj+gBjoTPjT6BADs=\')',
    null,FOOPLOT_MODE_INTERSECTION,'Find Intersections and Roots');


  this.zoomboxBox=document.createElement('div');
  this.zoomboxBox.style.position='absolute';
  this.zoomboxBox.style.visibility='hidden';
  this.zoomboxBox.style.width='1px';
  this.zoomboxBox.style.height='1px';
  this.zoomboxBox.style.top='-1px';
  this.zoomboxBox.style.left='-1px';
  this.zoomboxBox.style.border='1px solid #ff8000';
  this.zoomboxBox.style.background='#ffa000';
  this.zoomboxBox.style.opacity=0.5;
  this.zoomboxBox.style.filter='alpha(opacity=50)';
  this.zoomboxBox.style.zIndex=50;
  this.container.appendChild(this.zoomboxBox);

  this.tracePoint=document.createElement('div');
  this.tracePoint.style.position='absolute';
  this.tracePoint.style.visibility='hidden';
  this.tracePoint.style.width='5px';
  this.tracePoint.style.height='5px';
  this.tracePoint.style.top='-1px';
  this.tracePoint.style.left='-1px';
  this.tracePoint.style.border='1px solid #ffffff';
  this.tracePoint.style.background='#ff8000';
  this.tracePoint.style.zIndex=50;
  this.container.appendChild(this.tracePoint);

  this.traceDisplay=document.createElement('div');
  this.traceDisplayText=document.createTextNode('');
  this.traceDisplay.style.position='absolute';
  this.traceDisplay.style.visibility='hidden';
  this.traceDisplay.style.height='20px';
  this.traceDisplay.style.padding='4px';
  this.traceDisplay.style.top='-1px';
  this.traceDisplay.style.left='-1px';
  this.traceDisplay.style.border='1px solid #a0a0a0';
  this.traceDisplay.style.background='#ffffff';
  this.traceDisplay.style.webkitBoxShadow='5px 5px 5px #808080';
  this.traceDisplay.style.MozBoxShadow='5px 5px 5px #808080';
  this.traceDisplay.style.OBoxShadow='5px 5px 5px #808080';
  this.traceDisplay.style.msBoxShadow='5px 5px 5px #808080';
  this.traceDisplay.style.boxShadow='5px 5px 5px #808080';
  this.traceDisplay.style.zIndex=50;
  this.traceDisplay.appendChild(this.traceDisplayText);
  this.container.appendChild(this.traceDisplay);


  this.intersectionPoint=document.createElement('div');
  this.intersectionPoint.style.position='absolute';
  this.intersectionPoint.style.visibility='hidden';
  this.intersectionPoint.style.width='5px';
  this.intersectionPoint.style.height='5px';
  this.intersectionPoint.style.top='-1px';
  this.intersectionPoint.style.left='-1px';
  this.intersectionPoint.style.border='1px solid #ffffff';
  this.intersectionPoint.style.background='#ff8000';
  this.intersectionPoint.style.zIndex=50;
  this.container.appendChild(this.intersectionPoint);

  this.intersectionDisplay=document.createElement('div');
  this.intersectionDisplayText=document.createTextNode('');
  this.intersectionDisplay.style.position='absolute';
  this.intersectionDisplay.style.visibility='hidden';
  this.intersectionDisplay.style.height='20px';
  this.intersectionDisplay.style.padding='4px';
  this.intersectionDisplay.style.top='-1px';
  this.intersectionDisplay.style.left='-1px';
  this.intersectionDisplay.style.border='1px solid #a0a0a0';
  this.intersectionDisplay.style.background='#ffffff';
  this.intersectionDisplay.style.webkitBoxShadow='5px 5px 5px #808080';
  this.intersectionDisplay.style.MozBoxShadow='5px 5px 5px #808080';
  this.intersectionDisplay.style.OBoxShadow='5px 5px 5px #808080';
  this.intersectionDisplay.style.msBoxShadow='5px 5px 5px #808080';
  this.intersectionDisplay.style.boxShadow='5px 5px 5px #808080';
  this.intersectionDisplay.style.zIndex=50;
  this.intersectionDisplay.appendChild(this.intersectionDisplayText);
  this.container.appendChild(this.intersectionDisplay);

  this.selectMode(FOOPLOT_MODE_MOVE);

  this.canvas=false;
  this.context=false;
  this.vars={'pi':3.14159265358979323,'e':2.718281828459045,'s':0,'t':0,'x':0,'theta':0};
  this.plots=[];
  this.plotlastid=0;
  this.width=false;
  this.height=false;

  // window options
  this.xmin=-6.5;
  this.xmax=6.5;
  this.ymin=-4;
  this.ymax=4;
  this.xgrid=''; // blank means auto
  this.ygrid=''; // blank means auto
  this.xgridunits=null;
  this.ygridunits=null;

  this.showGrid=true;
  this.showAxes=true;
  this.showTicks=true;
  this.showLabels=true;

  this.gridColor='#D0D0D0';
  this.axesColor='#606060';
  this.labelsColor='#606060';
  this.backgroundColor='#FFFFFF';

  this.setSize=function() {
    this.width=this.container.offsetWidth;
    this.height=this.container.offsetHeight;
    this.canvas.setAttribute('width',this.width);
    this.canvas.setAttribute('height',this.height);
    this.recorder.width=this.width;
    this.recorder.height=this.height;
  }

  this.canvas=document.createElement('canvas');
  try { if(FOOPLOT_MSIE) {
    G_vmlCanvasManager.initElement(this.canvas);
  } } catch(error) { }
  this.subcontainer.appendChild(this.canvas);
  this.setSize();
  this.canvas.style.webkitBackfaceVisibility='hidden';
  this.canvas.style.webkitTransform='translate3d(0,0,0)';
  this.canvas.style.MozTransform='translate3d(0,0,0)';
  this.context=this.canvas.getContext("2d");

  this.getRealGrid=function() {
    if(parseFloat(this.xgrid)) {
      realxgrid=this.xgrid;
    } else {
      orderfull=-0.9+Math.log(this.xmax-this.xmin)/Math.log(10);
      order=Math.floor(orderfull);
      rem=orderfull-order;
      realxgrid=Math.pow(10,order);
      if(rem>.7) realxgrid*=5;
      else if(rem>.3) realxgrid*=2;
    }
    if(parseFloat(this.ygrid)) {
      realygrid=this.ygrid;
    } else {
      orderfull=-0.9+Math.log(this.width/this.height*(this.ymax-this.ymin))/Math.log(10);
      order=Math.floor(orderfull);
      rem=orderfull-order;
      realygrid=Math.pow(10,order);
      if(rem>.7) realygrid*=5;
      else if(rem>.3) realygrid*=2;
    }
    return [realxgrid,realygrid];
  }

  this.drawGrid=function() {
    var px,py,x,y,realxgrid,realygrid,order,orderfull,g;
    g=this.getRealGrid();
    realxgrid=g[0];
    realygrid=g[1];
    if((this.ymax-this.ymin)/realygrid>this.height/2 || (this.xmax-this.xmin)/realxgrid>this.width/2) {
      this.context.fillRect(0,0,this.width,this.height);
    } else {
      this.context.beginPath();
      for(y=Math.ceil(this.ymin/realygrid)*realygrid;y<=this.ymax;y+=realygrid) {
        py=(1-(y-this.ymin)/(this.ymax-this.ymin))*this.height;
        this.context.moveTo(0,Math.floor(py));
        this.context.lineTo(this.width,Math.floor(py));
      }
      for(x=Math.ceil(this.xmin/realxgrid)*realxgrid;x<=this.xmax;x+=realxgrid) {
        px=(x-this.xmin)/(this.xmax-this.xmin)*this.width;
        this.context.moveTo(Math.floor(px),0);
        this.context.lineTo(Math.floor(px),this.height);
      }
      this.context.stroke();
    }
  }

  this.drawLabels=function() {
    var px,py,x,y,realxgrid,realygrid;
    g=this.getRealGrid();
    realxgrid=g[0];
    realygrid=g[1];
    var orderx=Math.pow(10,2-Math.floor(Math.log(this.xmax-this.xmin)/Math.log(10)));
    var ordery=Math.pow(10,2-Math.floor(Math.log(this.ymax-this.ymin)/Math.log(10)));
    this.context.font='10px Droid Sans,Trebuchet MS,Arial,Helvetica,sans-serif';
    px=(0-this.xmin)/(this.xmax-this.xmin)*this.width;
    this.context.textAlign='left';
    if(px<0) px=0;
    if(px>this.width-this.width/80-16) {
      if(this.xmax>0) px-=20;
      else px=this.width-this.width/100-18;
      this.context.textAlign='right';
    }
    if((this.ymax-this.ymin)/realygrid<this.height/6) {
      for(y=Math.floor(this.ymin/realygrid)*realygrid;y<=this.ymax;y+=realygrid) {
        py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
        if(this.ygridunits==FOOPLOT_UNITS_PI) {
          printy=this.tryToMakeFraction(y/this.vars.pi)+'π';
        } else if(this.ygridunits==FOOPLOT_UNITS_E) {
          printy=this.tryToMakeFraction(y/this.vars.e)+'e';
        } else {
          printy=parseFloat(Math.round(y*ordery)/ordery);
        }
        if(py>8 && py<this.height-8) this.context.fillText(printy,px+this.width/80,py+2.5);
      }
    }
    this.context.textAlign='center';
    py=(this.ymax)/(this.ymax-this.ymin)*this.height;
    if(py<0) py=0;
    if(py>this.height-16-this.width/80) {
      if(this.ymin<0) py-=22;
      else py=this.height-20-this.width/100;
    }
    if((this.xmax-this.xmin)/realxgrid<this.width/6) {
      for(x=Math.floor(this.xmin/realxgrid)*realxgrid;x<=this.xmax;x+=realxgrid) {
        px=(x-this.xmin)/(this.xmax-this.xmin)*this.width;
        if(this.xgridunits==FOOPLOT_UNITS_PI) {
          printx=this.tryToMakeFraction(x/this.vars.pi)+'π';
        } else if(this.xgridunits==FOOPLOT_UNITS_E) {
          printx=this.tryToMakeFraction(x/this.vars.e)+'e';
        } else {
          printx=parseFloat(Math.round(x*orderx)/orderx);
        }
        if(px>8 && px<this.width-8) this.context.fillText(printx,px,py+this.width/80+8);
      }
    }
  }
  this.drawAxes=function() {
    var px,py,x,y,realxgrid,realygrid;
    g=this.getRealGrid();
    realxgrid=g[0];
    realygrid=g[1];
    if(this.xmin<0 && this.xmax>0) {
      px=(0-this.xmin)/(this.xmax-this.xmin)*this.width;
    } else if(this.xmin>=0) {
      px=0;
    } else if(this.xmax<=0) {
      px=this.width;
    }
    this.context.beginPath();
    this.context.moveTo(px,0);
    this.context.lineTo(px,this.height);
    this.context.stroke();
    if(this.showTicks) {
      if((this.ymax-this.ymin)/realygrid>this.height/2) {
        this.context.fillRect(px-this.width/100,0,this.width/50,this.height);
      } else {
        this.context.beginPath();
        for(y=Math.floor(this.ymin/realygrid)*realygrid;y<=this.ymax;y+=realygrid) {
          py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
          this.context.moveTo(px-this.width/100,py);
          this.context.lineTo(px+this.width/100,py);
        }
        this.context.stroke();
      }
    }
    if(this.ymin<0 && this.ymax>0) {
      py=(1-(0-this.ymin)/(this.ymax-this.ymin))*this.height;
    } else if(this.ymin>=0) {
      py=this.height;
    } else if(this.ymax<=0) {
      py=0;
    }
    this.context.beginPath();
    this.context.moveTo(0,py);
    this.context.lineTo(this.width,py);
    this.context.stroke();
    if(this.showTicks) {
      if((this.xmax-this.xmin)/realxgrid>this.width/2) {
        this.context.fillRect(0,py-this.width/100,this.width,this.width/50);
      } else {
        this.context.beginPath();
        for(x=Math.floor(this.xmin/realxgrid)*realxgrid;x<=this.xmax;x+=realxgrid) {
          px=(x-this.xmin)/(this.xmax-this.xmin)*this.width;
          this.context.moveTo(px,py-this.width/100);
          this.context.lineTo(px,py+this.width/100);
        }
        this.context.stroke();
      }
    }
  }

  this.clear=function() {
    if(this.context!=this.recorder) {
      this.canvas.width=this.canvas.width;
    }
    if(this.context.clear) {
      this.context.clear();
    }
    this.context.fillStyle=this.backgroundColor;
    this.context.fillRect(0,0,this.width,this.height);
  }

  // PRIVATE: EVENT HANDLERS

  this.isMouseDown=0;
  this.dragInitX=0;
  this.dragInitY=0;
  this.dpx=0;
  this.dpy=0;

  this.container.onmousemove=function(e) {
    if(e == null) e = window.event;
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e && e.preventDefault) e.preventDefault();
    if(e && (e.srcElement?e.srcElement:e.target).className=='fooplot-tool') return null;
    if(_self.zoomTimeout) return null;
    var offx=_self.container.offsetLeft;
    var offy=_self.container.offsetTop;
    if(_self.container.parentNode) {
      offx+=_self.container.parentNode.offsetLeft;
      offy+=_self.container.parentNode.offsetTop;
    }
    var mx=(!FOOPLOT_MSIE?e.pageX:(document.body.scrollLeft+event.clientX))-offx;
    var my=(!FOOPLOT_MSIE?e.pageY:(document.body.scrollTop+event.clientY))-offy;
    if(_self.isMouseDown) {
      _self.dpx=mx-_self.dragInitX;
      _self.dpy=my-_self.dragInitY;
      switch(_self.selectedMode) {
        case FOOPLOT_MODE_MOVE:
        _self.subcontainer.style.left=_self.dpx+'px';
        _self.subcontainer.style.top=_self.dpy+'px';
        break;
        case FOOPLOT_MODE_ZOOMBOX:
        _self.zoomboxBox.style.width=(_self.dpx)+'px';
        _self.zoomboxBox.style.height=(_self.dpy)+'px';
        break;
        case FOOPLOT_MODE_TRACE:
        var initx=mx/_self.width*(_self.xmax-_self.xmin)+_self.xmin;
        var order=Math.pow(10,2-Math.floor(Math.log(_self.xmax-_self.xmin)/Math.log(10)));
        var initx=parseFloat(Math.floor(initx*order)/order);
        var inity=(1-my/_self.height)*(_self.ymax-_self.ymin)+_self.ymin;
        _self.showTrace(initx,inity);
        break;
      }
    }
  }

  this.container.onmouseover=function(e) {
    if(e == null) e = window.event;
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e && e.preventDefault) e.preventDefault();
    _self.toolcontainer.style.visibility='visible';
    if(e && (e.srcElement?e.srcElement:e.target).className=='fooplot-tool') return null;
  }

  this.container.onmouseout=function(e) {
    if(e == null) e = window.event;
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e && e.preventDefault) e.preventDefault();
    _self.toolcontainer.style.visibility='hidden';
    if(e && (e.srcElement?e.srcElement:e.target).className=='fooplot-tool') return null;
    this.onmouseup(e);
  }

  this.container.onmousedown=function(e) {
    if(e == null) e = window.event;
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e && e.preventDefault) e.preventDefault();
    if(e && (e.srcElement?e.srcElement:e.target).className=='fooplot-tool') return null;
    if(_self.zoomTimeout) return null;
    var offx=_self.container.offsetLeft;
    var offy=_self.container.offsetTop;
    if(_self.container.parentNode) {
      offx+=_self.container.parentNode.offsetLeft;
      offy+=_self.container.parentNode.offsetTop;
    }
    var mx=(!FOOPLOT_MSIE?e.pageX:(document.body.scrollLeft+event.clientX))-offx;
    var my=(!FOOPLOT_MSIE?e.pageY:(document.body.scrollTop+event.clientY))-offy;
    _self.dragInitX=mx;
    _self.dragInitY=my;
    _self.isMouseDown=true;
    switch(_self.selectedMode) {
      case FOOPLOT_MODE_ZOOMBOX:
      _self.zoomboxBox.style.left=mx+'px';
      _self.zoomboxBox.style.top=my+'px';
      _self.zoomboxBox.style.width='0px';
      _self.zoomboxBox.style.height='0px';
      _self.zoomboxBox.style.visibility='visible';
      break;
    }
  }

  this.container.onmouseup=function(e) {
    if(e == null) e = window.event;
    if(e && e.preventDefault) e.preventDefault();
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    var offx=_self.container.offsetLeft;
    var offy=_self.container.offsetTop;
    if(_self.container.parentNode) {
      offx+=_self.container.parentNode.offsetLeft;
      offy+=_self.container.parentNode.offsetTop;
    }
    var mx=(!FOOPLOT_MSIE?e.pageX:(document.body.scrollLeft+event.clientX))-offx;
    var my=(!FOOPLOT_MSIE?e.pageY:(document.body.scrollTop+event.clientY))-offy;
    if(_self.isMouseDown) {
      _self.isMouseDown=false;
      switch(_self.selectedMode) {
        case FOOPLOT_MODE_MOVE:
        if(_self.zoomTimeout) return null;
        var dx=_self.dpx/_self.width*(_self.xmax-_self.xmin);
        var dy=_self.dpy/_self.height*(_self.ymax-_self.ymin);
        _self.xmin-=dx;
        _self.xmax-=dx;
        _self.ymin+=dy;
        _self.ymax+=dy;
        _self.dpx=0;
        _self.dpy=0;
        _self.subcontainer.style.left='0px';
        _self.subcontainer.style.top='0px';
        _self.reDraw();
        _self.onWindowChange([_self.xmin,_self.xmax,_self.ymin,_self.ymax]);
        break;
        case FOOPLOT_MODE_ZOOMBOX:
        _self.zoomboxBox.style.visibility='hidden';
        _self.selectMode(FOOPLOT_MODE_MOVE);
        if(parseInt(_self.zoomboxBox.style.width)>5 && parseInt(_self.zoomboxBox.style.height)>5) {
          var newxmin=(parseInt(_self.zoomboxBox.style.left)/_self.width)*(_self.xmax-_self.xmin)+_self.xmin;
          var newymax=_self.ymax-(parseInt(_self.zoomboxBox.style.top)/_self.height)*(_self.ymax-_self.ymin);
          var newxmax=((parseInt(_self.zoomboxBox.style.left)+parseInt(_self.zoomboxBox.style.width))/_self.width)*(_self.xmax-_self.xmin)+_self.xmin;
          var newymin=_self.ymax-((parseInt(_self.zoomboxBox.style.top)+parseInt(_self.zoomboxBox.style.height))/_self.height)*(_self.ymax-_self.ymin);
          _self.xmin=newxmin;
          _self.xmax=newxmax;
          _self.ymin=newymin;
          _self.ymax=newymax;
          _self.reDraw();
          _self.onWindowChange([_self.xmin,_self.xmax,_self.ymin,_self.ymax]);
        }
        break;
        case FOOPLOT_MODE_INTERSECTION:
        _self.showIntersection(_self.dragInitX/_self.width*(_self.xmax-_self.xmin)+_self.xmin);
        break;
        case FOOPLOT_MODE_TRACE:
        var initx=mx/_self.width*(_self.xmax-_self.xmin)+_self.xmin;
        var order=Math.pow(10,2-Math.floor(Math.log(_self.xmax-_self.xmin)/Math.log(10)));
        var initx=parseFloat(Math.floor(initx*order)/order);
        var inity=(1-my/_self.height)*(_self.ymax-_self.ymin)+_self.ymin;
        _self.showTrace(initx,inity);
        break;
      }
    }
  }

  this.lastTouch=null;

  this.container.ontouchmove=function(e) {
    e.preventDefault();
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e.touches.length>=1) {
      var _touch=e.touches[0];
      _self.lastTouch=_touch;
      this.mousemove(_touch);
    } else {
      _self.lastTouch=null;
    }
  }

  this.container.ontouchstart=function(e) {
    e.preventDefault();
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e.touches.length>=1) {
      var _touch=e.touches[0];
      _self.lastTouch=_touch;
      this.mousedown(_touch);
    } else {
      _self.lastTouch=null;
    }
  }

  this.container.ontouchend=function(e) {
    e.preventDefault();
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e.touches.length==0) {
      this.mouseup(_self.lastTouch);
      _self.lastTouch=null;
    }
  }

  this.onmousewheel=function(e) {
    if(e == null) e = window.event;
    for (i in FOOPLOT_INSTANCES) if(this==FOOPLOT_INSTANCES[i].container) var _self=FOOPLOT_INSTANCES[i];
    if(e && e.preventDefault) e.preventDefault();
    else e.returnValue=false;
    if(e && (e.srcElement?e.srcElement:e.target).className=='fooplot-tool') return null;
    var delta = 0;
    if(e.wheelDelta) { /* IE/Opera. */
      delta = e.wheelDelta/120;
    } else if (e.detail) { /** Mozilla case. */
      delta = -e.detail/3;
    }
    if(delta>0 && _self.zoomPendingFactor<=8) _self.zoom(1.25);
    else if(delta<0 && _self.zoomPendingFactor>=0.125) _self.zoom(0.8);
    else if(delta) _self.zoom(1);
  }

  this.container.onmousewheel=this.onmousewheel;

  if(this.container.addEventListener) {
    this.container.addEventListener('DOMMouseScroll',this.onmousewheel,false);
  }

  this.drawPoints=function(points) {
    if(points.length) {
      for(i in points) {
        if(points[i].length==2) {
          px=(points[i][0]-this.xmin)/(this.xmax-this.xmin)*this.width;
          py=(this.ymax-points[i][1])/(this.ymax-this.ymin)*this.height;
          if(!isNaN(px) && !isNaN(py) && 0<=px && px<=this.width && 0<=py && py<=this.height) {
            this.context.fillRect(px-2,py-2,5,5);
          }
        }
      }
    }
  }

  this.drawFunction=function(jeq) {
    var px,py,y,thisIsNaN=false,lastOnScreen,lastIsNaN=false,thisOnScreen,lastpx,lastpy,lasty,lastychange,isRedoLoop=false;
    this.context.beginPath();
    var started=false;
    var pxstep=FOOPLOT_MSIE?1:0.25;
    this.context.moveTo(-10,this.height/2);
    for(px=0;px<this.width;px+=pxstep) {
      this.vars.x=(px/this.width)*(this.xmax-this.xmin)+this.xmin;
      y=jeq(this.vars);
      if(isNaN(y)) {
        if(!lastIsNaN) {
          if(lastychange>0 && lasty>0) this.context.lineTo(lastpx,0);
          else if(lastychange<0 && lasty<0) this.context.lineTo(lastpx,this.height);
        }
        thisOnScreen=false;
        thisIsNaN=true;
      } else {
        py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
        thisOnScreen=py>=0 && py<=this.height;
        if(py>this.height+100) py=this.height+100;
        if(py<-100) py=-100;
        thisIsNaN=false;
      }
      if(pxstep>.001 && thisOnScreen && !lastOnScreen) {
        px-=pxstep;
        pxstep/=10;
      } else {
        if(!(lastIsNaN || thisIsNaN) && (lastOnScreen || thisOnScreen)) {
          this.context.lineTo(px,py);
        } else {
          if(!lastIsNaN && !thisIsNaN && lasty*y<0 && lasty*y>Math.min(-10,this.ymin-this.ymax)) {
            this.context.lineTo(px,py);
          } else {
            this.context.moveTo(px,py);
          }
        }
        if(thisOnScreen) pxstep=pxstep/Math.abs(lastpy-py);
        else pxstep=1;
        if(pxstep>2) pxstep=2;
        else if(pxstep<0.001) pxstep=0.001;
        else if(isNaN(pxstep)) pxstep=1;
        lastpx=px;
        lastpy=py;
        lasty=y;
        lastOnScreen=thisOnScreen;
        lastIsNaN=thisIsNaN;
      }
    }
    this.context.stroke();
  }

  this.drawPolar=function(jeq,thetamin,thetamax,thetastep) {
    var px,py,x,y,r,lastOnScreen,thisOnScreen;
    this.context.beginPath();
    var points='';
    var started=false;
    for(this.vars.theta=thetamin;this.vars.theta<=thetamax;this.vars.theta+=thetastep) {
      r=jeq(this.vars);
      x=r*Math.cos(this.vars.theta);
      y=r*Math.sin(this.vars.theta);
      if(isNaN(y)||isNaN(x)) 
        thisOnScreen=false;
      else {
        px=(x-this.xmin)/(this.xmax-this.xmin)*this.width;
        py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
        if(!started) { started=true;this.context.moveTo(px,py); }
        thisOnScreen=(px>0 && px<this.width && py>0 && py<this.height);
        if(lastOnScreen || thisOnScreen) {
          this.context.lineTo(px,py);
        } else {
          this.context.moveTo(px,py);
        }
      }
      lastOnScreen=thisOnScreen;
    }
    this.context.stroke();
  }

  this.drawParametric=function(jeqx,jeqy,smin,smax,sstep) {
    var px,py,x,y,lastOnScreen,thisOnScreen;
    var started=false;
    this.context.beginPath();
    for(this.vars.s=smin;this.vars.s<=smax;this.vars.s+=sstep) {
      x=jeqx(this.vars);
      y=jeqy(this.vars);
      if(isNaN(y)||isNaN(x))
        thisOnScreen=false;
      else {
        px=(x-this.xmin)/(this.xmax-this.xmin)*this.width;
        py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
        if(!started) { started=true; this.context.moveTo(px,py); }
        thisOnScreen=(px>0 && px<this.width && py>0 && py<this.height);
        if(lastOnScreen || thisOnScreen) {
          this.context.lineTo(px,py);
        } else {
          this.context.moveTo(px,py);
        }
      }
      lastOnScreen=thisOnScreen;
    }
    this.context.stroke();
  }

  this.findIntersection=function(jeq0,jeq1,initx) {
    var xpd,y0,y1,y,ypd,d=.0000000001;
    var i=0;
    if(jeq0==null) return 0;
    if(jeq1==null) { jeq1=function() { return 0; } }
    this.vars.x=initx;
    y0=jeq0(this.vars);
    y1=jeq1(this.vars);
    y=y0-y1;
    while(i<100) {
      i++;
      y0=jeq0(this.vars);
      y1=jeq1(this.vars);
      y=y0-y1;
      this.vars.x+=d;
      y0=jeq0(this.vars);
      y1=jeq1(this.vars);
      ypd=y0-y1;
      if(y-ypd!=0) {
        this.vars.x+=y*d/(y-ypd);
      }
    }
    y0=jeq0(this.vars);
    y1=jeq1(this.vars);
    y=y0-y1;
    if(isNaN(this.vars.x)) return null;
    if(Math.abs(y)>1e-9) return null;
    else return parseFloat(this.vars.x.toFixed(9));
  }

  this.showTrace=function(initx,inity) {
    var i,y,minDistance=1e10,besti=null,besty=null;
    this.vars.x=initx;
    for(i in this.plots) {
      if(this.plots[i]['type']==FOOPLOT_TYPE_FUNCTION) {
        y=this.plots[i].jeq(this.vars);
        if(Math.abs(y-inity)<minDistance) { minDistance=Math.abs(y-inity);besti=i;besty=y; }
      }
    }
    if(besti===null) return null;
    px=(initx-this.xmin)/(this.xmax-this.xmin)*this.width;
    py=(this.ymax-besty)/(this.ymax-this.ymin)*this.height;
    this.tracePoint.style.visibility='';
    this.tracePoint.style.left=(px-3)+'px';
    this.tracePoint.style.top=(py-3)+'px';
    this.traceDisplay.style.visibility='';
    this.traceDisplay.style.left=px+'px';
    this.traceDisplay.style.top=(py+8-(py>this.height/2?48:0))+'px';
    this.traceDisplayText.nodeValue=('('+parseFloat(initx.toFixed(9))+','+parseFloat(besty.toFixed(9))+')');
  }

  this.showIntersection=function(initx) {
    this.vars.x=initx;
    var i,j,yi,yj,minDistance=1e10,bestPair=null;
    this.plotstmp=this.plots.slice(0);
    this.plotstmp.unshift({'type':FOOPLOT_TYPE_FUNCTION,'jeq':function() {return 0;}});
    for(i in this.plotstmp) {
      if(this.plotstmp[i]['type']==FOOPLOT_TYPE_FUNCTION) {
        for(j in this.plotstmp) {
          if(i!=j && this.plotstmp[j]['type']==FOOPLOT_TYPE_FUNCTION) {
            yi=this.plotstmp[i].jeq(this.vars);
            yj=this.plotstmp[j].jeq(this.vars);
            if(Math.abs(yi-yj)<minDistance) { minDistance=Math.abs(yi-yj);bestPair=[i,j]; }
          }
        }
      }
    }
    if(bestPair===null) return null;
    xroot=this.findIntersection(this.plotstmp[bestPair[0]].jeq,this.plotstmp[bestPair[1]].jeq,initx);
    y=this.plotstmp[bestPair[0]].jeq(this.vars);
    y=parseFloat(y.toFixed(9));
    px=(xroot-this.xmin)/(this.xmax-this.xmin)*this.width;
    py=(this.ymax-y)/(this.ymax-this.ymin)*this.height;
    if(xroot!=null) {
      this.intersectionPoint.style.visibility='';
      this.intersectionPoint.style.left=(px-3)+'px';
      this.intersectionPoint.style.top=(py-3)+'px';
      this.intersectionDisplay.style.visibility='';
      this.intersectionDisplay.style.left=px+'px';
      this.intersectionDisplay.style.top=(py+8-(py>this.height/2?48:0))+'px';
      this.intersectionDisplayText.nodeValue=('('+xroot+','+y+')');
    }
  }

  this.tryToMakeFraction=function(testnum) {
    var numerator,denominator;
    // check if it is a nice fraction
    for(var denominator=1;denominator<16;denominator++) {
      numerator=(testnum*denominator).toFixed(9);
      if(numerator.indexOf('.000000000')!=-1) return parseFloat(numerator)+(denominator==1?'':'/'+denominator);
    }
    // return the decimal back if we fail to get a nice fraction
    return parseFloat(testnum.toFixed(9)).toString();
  }

  // PRIVATE: EQUATION PARSNIP

  this.parseEquationError='';

  this.parseEquationHasElement=function(v,e) {for(var i=0;i<v.length;i++) if(v[i]==e) return true;return false;}

  this.parseEquationFixPowers=function(v) {
    if(v==null) { this.parseEquationError?null:this.parseEquationError="syntax error"; return null; }
    for(i=0;i<v.length;i++) {
      if(this.parseEquationIsArray(v[i])) { v[i]=this.parseEquationFixPowers(v[i]); if(v[i]==null) { this.parseEquationError?null:this.parseEquationError="syntax error"; return null; } }
    }
    for(var i=0;i<v.length;i++) {
      if(v[i]=='^') {
        if(v[i-1]==null||v[i+1]==null) { this.parseEquationError="^ requires two arguments, for example x^2 or (x+1)^(x+2)."; return null; }
        v.splice(i-1,3,new Array('Math.pow',new Array('(',v[i-1],',',v[i+1],')')));
        i-=2;
      }
    }
    return v;
  }

  this.parseEquationFixFunctions=function(v) {
    if(v==null) {this.parseEquationError?null:this.parseEquationError="syntax error"; return null;}
    for(i=0;i<v.length;i++) {
      if(this.parseEquationIsArray(v[i])) {
        v[i]=this.parseEquationFixFunctions(v[i]);
        if(v[i]==null) {this.parseEquationError?null:this.parseEquationError="syntax error"; return null;}
      }
    }
    for(var i=0;i<v.length;i++) {
      if(!this.parseEquationIsArray(v[i])) {
        if(FOOPLOT_MATH[v[i]]!=undefined) {
          if(v[i+1]==null) {this.parseEquationEror="function "+v[i]+ " requires an argument."; return null;}
          v[i]='FOOPLOT_MATH.'+v[i].toLowerCase();
          v.splice(i,2,new Array('(',v[i],v[i+1],')'));
          i--;
        }
      }
    }
    return v;
  }

  this.parseEquationIsArray=function(v) {if(v==null){return 0;}if(v.constructor.toString().indexOf("Array")==-1)return false;return true;}

  this.parseEquationJoinArray=function(v) {var t="";for(var i=0;i<v.length;i++){if(this.parseEquationIsArray(v[i])){ t+=this.parseEquationJoinArray(v[i]);}else{t+=v[i];}}return t;}

  this.parseEquation=function(eq,vars) {
    var jeq=null;
    var tokens;
    var e,i;
    var pstart=-1,pend;
    if(!vars) vars=this.vars;
    jeq_error="";
    e=eq.replace(/ /g,"");
    e=e.replace(/([0-9])([a-df-z]|[a-z][a-z]|\()/ig,"$1*$2");
    e=e.replace(/(\))([0-9a-df-z]|[a-z][a-z]|\()/ig,"$1*$2");
    e=e.replace(/([a-z0-9\.])([^a-z0-9\.])/ig,"$1 $2");
    e=e.replace(/([^a-z0-9\.])([a-z0-9\.])/ig,"$1 $2");
    e=e.replace(/(\-|\)|\()/g," $1 ");
    tokens=e.split(/ +/);
    for(i=0;i<tokens.length;i++) {
      tokens[i]=tokens[i].replace(/ /g,"");
      tokens[i]=tokens[i].replace(/_/g,".");
      if(tokens[i]=='') { tokens.splice(i,1);i--; }
      else if(tokens[i].match(/^[a-z][a-z0-9]*$/i) && vars[tokens[i]]!=undefined) { tokens[i]='vars.'+tokens[i]; }
      else if(tokens[i].length>0 && tokens[i].match(/^[a-z][a-z0-9]*$/i) && FOOPLOT_MATH[tokens[i]]==undefined) { this.parseEquationError="invalid variable or function: "+tokens[i];return null; }
    }
    while(this.parseEquationHasElement(tokens,'(')||this.parseEquationHasElement(tokens,')')) {
      pstart=-1;
      for(i=0;i<tokens.length;i++) {
        if(tokens[i]=='(') pstart=i;
        if(tokens[i]==')'&&pstart==-1) { this.parseEquationError="unmatched right parenthesis )";return null; }
        if(tokens[i]==')'&&pstart!=-1) {
          tokens.splice(pstart,i-pstart+1,tokens.slice(pstart,i+1));
          i=-1;
          pstart=-1;
        }
      }
      if(pstart!=-1) { this.parseEquationError="unmatched left parenthesis (";return null; }
    }
    tokens=this.parseEquationFixFunctions(tokens);
    if(tokens==null) { return null; }
    tokens=this.parseEquationFixPowers(tokens);
    if(tokens==null) { return null; }
    eval('jeq=function(vars) { return '+this.parseEquationJoinArray(tokens)+'; }');
    return jeq;
  }

  this.parseConst=function(eq) {
    var consts={'pi':this.vars.pi,'e':this.vars.e};
    var f=this.parseEquation(eq,consts);
    if(f)
      return parseFloat(f(consts));
    else {
      alert(this.parseEquationError);
      return 0;
    }
  }

  // PUBLIC

  this.reDraw=function() {
    this.hideIntersection();
    this.hideTrace();
    this.clear();
    if(this.showGrid) {
      this.context.strokeStyle=this.gridColor;
      this.context.fillStyle=this.gridColor;
      this.drawGrid();
    }
    if(this.showAxes) {
      this.context.strokeStyle=this.axesColor;
      this.context.fillStyle=this.axesColor;
      this.drawAxes();
    }
    if(this.showLabels) {
      this.context.fillStyle=this.labelsColor;
      this.drawLabels();
    }
    for(var i in this.plots) {
      this.context.strokeStyle='#000000';
      switch(this.plots[i].type) {
        case FOOPLOT_TYPE_FUNCTION:
          this.context.strokeStyle=this.plots[i].options.color;
          this.drawFunction(this.plots[i].jeq);
          break;
        case FOOPLOT_TYPE_POLAR:
          this.context.strokeStyle=this.plots[i].options.color;
          this.drawPolar(this.plots[i].jeq,this.plots[i].options.thetamin,this.plots[i].options.thetamax,this.plots[i].options.thetastep);
          break;
        case FOOPLOT_TYPE_PARAMETRIC:
          this.context.strokeStyle=this.plots[i].options.color;
          this.drawParametric(this.plots[i].jeqx,this.plots[i].jeqy,this.plots[i].options.smin,this.plots[i].options.smax,this.plots[i].options.sstep);
          break;
        case FOOPLOT_TYPE_POINTS:
          this.context.fillStyle=this.plots[i].options.color;
          this.drawPoints(this.plots[i].eq);
          break;
      }
    }
    if(FOOPLOT_MSIE) {
      // hack for MSIE + excanvas which sometimes sporadically does not display the last-drawn path
      // so we draw a dummy path
      this.context.beginPath();
      this.context.moveTo(0,-1);
      this.context.lineTo(-1,-1);
      this.context.stroke();
    }
  }

  this.addPlot=function(eq,type,options) {
    if(!type)    type=FOOPLOT_TYPE_FUNCTION;
    if(!options) options={};
    if(!options.color) options.color='#000000';
    if(!options.width) options.width=1;
    switch(type) {
      case FOOPLOT_TYPE_FUNCTION:
        var jeq=this.parseEquation(eq);
        if(!jeq) {alert(this.parseEquationError);return null;}
        this.plots.push({'id':this.plotlastid++,'type':type,'eq':eq,'jeq':jeq,'options':options});
        break;
      case FOOPLOT_TYPE_POLAR:
        var jeq=this.parseEquation(eq);
        if(!jeq) {alert(this.parseEquationError);return null;}
        options['thetamin']=options['thetamin']?this.parseConst(options['thetamin']):0;
        options['thetamax']=options['thetamax']?this.parseConst(options['thetamax']):2*this.vars.pi;
        options['thetastep']=options['thetastep']?this.parseConst(options['thetastep']):0.01;
        if(options['thetastep']<=0) options['thetastep']=0.01;
        this.plots.push({'id':this.plotlastid++,'type':type,'eq':eq,'jeq':jeq,'options':options});
      break;
      case FOOPLOT_TYPE_PARAMETRIC:
        var jeqx=this.parseEquation(eq[0]);
        if(!jeqx) {alert(this.parseEquationError);return null;}
        var jeqy=this.parseEquation(eq[1]);
        if(!jeqy) {alert(this.parseEquationError);return null;}
        options['smin']=options['smin']?this.parseConst(options['smin']):0;
        options['smax']=options['smax']?this.parseConst(options['smax']):10;
        options['sstep']=options['sstep']?this.parseConst(options['sstep']):0.01;
        this.plots.push({'id':this.plotlastid++,'type':type,'eq':eq,'jeqx':jeqx,'jeqy':jeqy,'options':options});
      break;
      case FOOPLOT_TYPE_POINTS:
        if(eq.length==null) return null;
        this.plots.push({'id':this.plotlastid++,'type':type,'eq':eq,'options':options});
      break;
      default:
      alert("Error: invalid plot type");
    }
    return this.plots.size;
  }

  this.deletePlot=function(plotid) {
    // not yet implemented
  }

  this.deleteAllPlots=function() {
    this.plots=[];
  }

  this.getGrid=function() {
    return [this.xgrid,this.ygrid];
  }

  this.setGrid=function(g) {
    g[0]=g[0].replace(' ','');
    if(g[0]) {
      g[0]=this.parseConst(g[0]); if(g[0]<=0) g[0]=1;
      this.xgrid=g[0];
      if((720*g[0]/this.vars.pi).toFixed(6).match(/0000$/)!==null) {
        this.xgridunits=FOOPLOT_UNITS_PI;
      } else if((720*g[0]/this.vars.e).toFixed(6).match(/0000$/)!==null) {
        this.xgridunits=FOOPLOT_UNITS_E;
      } else {
        this.xgridunits=null;
      }
    } else {
      this.xgrid=null;
      this.xgridunits=null;
    }
    g[1]=g[1].replace(' ','');
    if(g[1]) {
      g[1]=this.parseConst(g[1]); if(g[1]<=0) g[1]=1;
      this.ygrid=g[1];
      if((720*g[1]/this.vars.pi).toFixed(6).match(/0000$/)!==null) {
        this.ygridunits=FOOPLOT_UNITS_PI;
      } else if((720*g[1]/this.vars.e).toFixed(6).match(/0000$/)!==null) {
        this.ygridunits=FOOPLOT_UNITS_E;
      } else {
        this.ygridunits=null;
      }
    } else {
      this.ygrid=null;
      this.ygridunits=null;
    }
  }

  this.getWindow=function() {
    return [this.xmin,this.xmax,this.ymin,this.ymax];
  }

  this.setWindow=function(w) {
    w[0]=this.parseConst(w[0]);
    w[1]=this.parseConst(w[1]);
    w[2]=this.parseConst(w[2]);
    w[3]=this.parseConst(w[3]);
    if(w[1]>w[0] && w[3]>w[2]) {
      this.xmin=w[0];
      this.xmax=w[1];
      this.ymin=w[2];
      this.ymax=w[3];
    } else {
      // throw error
    }
  }

  this.setBackgroundColor=function(color) {
    this.backgroundColor=color;
    this.container.style.background=color;
    this.subcontainer.style.background=color;
  }

  this.setLabelsColor=function(color) {
    this.labelsColor=color;
  }

  this.setAxesColor=function(color) {
    this.axesColor=color;
  }

  this.setGridColor=function(color) {
    this.gridColor=color;
  }

  this.setShowAxes=function(v) {
    this.showAxes=v;
  }

  this.setShowTicks=function(v) {
    this.showTicks=v;
  }

  this.setShowLabels=function(v) {
    this.showLabels=v;
  }

  this.setShowGrid=function(v) {
    this.showGrid=v;
  }

  this.getSVG=function() {
    this.context=this.recorder;
    this.reDraw();
    this.context=this.canvas.getContext('2d');
    return this.recorder.getSVG();
  }

  // EVENTS (user-settable functions)
  this.onWindowChange=function(w) {};
}

// interface "constants"

var FOOPLOT_TYPE_FUNCTION=0;
var FOOPLOT_TYPE_POLAR=1;
var FOOPLOT_TYPE_PARAMETRIC=2;
var FOOPLOT_TYPE_POINTS=3;

var FOOPLOT_MODE_MOVE=1;
var FOOPLOT_MODE_ZOOMBOX=2;
var FOOPLOT_MODE_INTERSECTION=3;
var FOOPLOT_MODE_TRACE=4;

var FOOPLOT_UNITS_PI=1;
var FOOPLOT_UNITS_E=2;

// keeps track of all instances, mainly for being able to access the class in event handlers

var FOOPLOT_INSTANCES=[];

// extended math functions

FOOPLOT_MATH={};
FOOPLOT_MATH.sin=Math.sin;
FOOPLOT_MATH.cos=Math.cos;
FOOPLOT_MATH.tan=Math.tan;
FOOPLOT_MATH.asin=Math.asin;
FOOPLOT_MATH.acos=Math.acos;
FOOPLOT_MATH.atan=Math.atan;
FOOPLOT_MATH.abs=Math.abs;
FOOPLOT_MATH.floor=Math.floor;
FOOPLOT_MATH.ceil=Math.ceil;
FOOPLOT_MATH.exp=Math.exp;
FOOPLOT_MATH.sqrt=Math.sqrt;
FOOPLOT_MATH.max=Math.max;
FOOPLOT_MATH.min=Math.min;
FOOPLOT_MATH.sec=function(x) { return 1/Math.cos(x); }
FOOPLOT_MATH.csc=function(x) { return 1/Math.sin(x); }
FOOPLOT_MATH.cot=function(x) { return 1/Math.tan(x); }
FOOPLOT_MATH.asec=function(x) { return Math.acos(1/x); }
FOOPLOT_MATH.acsc=function(x) { return Math.asin(1/x); }
FOOPLOT_MATH.acot=function(x) { return Math.atan(1/x); }
FOOPLOT_MATH.ln=function(x) { return Math.log(x); }
FOOPLOT_MATH.log=function(x) { return Math.log(x)/Math.log(10); }
FOOPLOT_MATH.sinh=function(x) { return (Math.exp(x)-Math.exp(-x))/2; }
FOOPLOT_MATH.cosh=function(x) { return (Math.exp(x)+Math.exp(-x))/2; }
FOOPLOT_MATH.tanh=function(x) { return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x)); }
FOOPLOT_MATH.asinh=function(x) { return Math.log(x+Math.sqrt(x*x+1)); }
FOOPLOT_MATH.acosh=function(x) { return Math.log(x+Math.sqrt(x*x-1)); }
FOOPLOT_MATH.atanh=function(x) { return 0.5*Math.log((1+x)/(1-x)); }
FOOPLOT_MATH.sech=function(x) { return 2/(Math.exp(x)+Math.exp(-x)); }
FOOPLOT_MATH.csch=function(x) { return 2/(Math.exp(x)-Math.exp(-x)); }
FOOPLOT_MATH.coth=function(x) { return (Math.exp(x)+Math.exp(-x))/(Math.exp(x)-Math.exp(-x)); }
FOOPLOT_MATH.asech=function(x) { return Math.log(1/x+Math.sqrt(1/x/x-1)); }
FOOPLOT_MATH.acsch=function(x) { return Math.log(1/x+Math.sqrt(1/x/x+1)); }
FOOPLOT_MATH.acoth=function(x) { return 0.5*Math.log((1+x)/(1-x)); }
FOOPLOT_MATH.u=function(x) { return (x>=0); }

var FOOPLOT_MSIE=(navigator.userAgent.toLowerCase().indexOf('msie')!=-1);

var FOOPLOT_TRANSITIONS=function() {
  var b = document.body||document.documentElement;
  var s = b.style;
  var p = 'transition';
  if(typeof s[p] == 'string') {return true; }
  v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
  p = p.charAt(0).toUpperCase() + p.substr(1);
  for(var i=0; i<v.length; i++) {
    if(typeof s[v[i] + p] == 'string') { return true; }
  }
  return false;
}();

