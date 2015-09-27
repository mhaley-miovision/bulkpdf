/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new toolbar for the given editor.
 */
function Toolbar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();

	// Global handler to hide the current menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.selectedBackground = '#d0d0d0';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.unselectedBackground = 'none';

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.init = function()
{

	this.contributorMenu = this.addMenu("Highlight Contributor...", "Select an contributor to highlight jobs.", true, 'contributor');
	this.contributorMenu.style.whiteSpace = 'nowrap';
	this.contributorMenu.style.overflow = 'hidden';
	this.contributorMenu.style.width =  '130px';

	this.addSeparator();

	this.applicationMenu = this.addMenu("Highlight Application...", "Select an application to highlight interrelationships.", true, 'application');
	this.applicationMenu.style.whiteSpace = 'nowrap';
	this.applicationMenu.style.overflow = 'hidden';
	this.applicationMenu.style.width = '130px';

	this.addSeparator();

	this.applicationMenu = this.addMenu('Switch Accountability Mode...', "Select view mode for accountabilities..", true, 'accountabilityMode');
	this.applicationMenu.style.whiteSpace = 'nowrap';
	this.applicationMenu.style.overflow = 'hidden';
	this.applicationMenu.style.width = '180px';

	this.addSeparator();

	var elts = this.addItems(['actualSize', 'zoomIn', 'zoomOut', '-']);
	elts[0].setAttribute('title', mxResources.get('actualSize') + ' (Ctrl+0)');
	elts[1].setAttribute('title', mxResources.get('zoomIn') + ' (Ctrl + / Alt+Scroll)');
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.createTextToolbar = function()
{
	var graph = this.editorUi.editor.graph;

	this.addItems(['undo', 'redo', '-']);
	
	var fontElt = this.addMenu(mxResources.get('style'), mxResources.get('style'), true, 'formatBlock');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	
	var fontElt = this.addMenu(Menus.prototype.defaultFont, mxResources.get('fontFamily'), true, 'fontFamily');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	fontElt.style.width = (mxClient.IS_QUIRKS) ? '76px' : '56px';
	
	this.addSeparator();
	
	var sizeElt = this.addMenu(Menus.prototype.defaultFontSize, mxResources.get('fontSize'), true, 'fontSize');
	sizeElt.style.whiteSpace = 'nowrap';
	sizeElt.style.overflow = 'hidden';
	sizeElt.style.width = (mxClient.IS_QUIRKS) ? '42px' : '22px';
	
	this.addItems(['-', 'bold', 'italic', 'underline']);

	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	this.addMenuFunction('geSprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'geIcon geSprite geSprite-left', null,
				function() { document.execCommand('justifyleft', false, null); }).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'geIcon geSprite geSprite-center', null,
				function() { document.execCommand('justifycenter', false, null); }).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'geIcon geSprite geSprite-right', null,
				function() { document.execCommand('justifyright', false, null); }).setAttribute('title', mxResources.get('right'));
	}));

	this.addMenuFunction('geSprite-fontcolor', mxResources.get('more') + '...', false, mxUtils.bind(this, function(menu)
	{
		// KNOWN: IE+FF don't return keyboard focus after color dialog (calling focus doesn't help)
		elt = menu.addItem('', null, this.editorUi.actions.get('fontColor').funct, null, 'geIcon geSprite geSprite-fontcolor');
		elt.setAttribute('title', mxResources.get('fontColor'));
		
		elt = menu.addItem('', null, this.editorUi.actions.get('backgroundColor').funct, null, 'geIcon geSprite geSprite-fontbackground');
		elt.setAttribute('title', mxResources.get('backgroundColor'));

		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('superscript', false, null);
		}), null, 'geIcon geSprite geSprite-superscript');
		elt.setAttribute('title', mxResources.get('superscript'));
		
		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('subscript', false, null);
		}), null, 'geIcon geSprite geSprite-subscript');
		elt.setAttribute('title', mxResources.get('subscript'));
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-orderedlist', mxResources.get('numberedList'), function()
	{
		document.execCommand('insertorderedlist', false, null);
	});
	
	this.addButton('geIcon geSprite geSprite-unorderedlist', mxResources.get('bulletedList'), function()
	{
		document.execCommand('insertunorderedlist', false, null);
	});
	
	this.addButton('geIcon geSprite geSprite-outdent', mxResources.get('decreaseIndent'), function()
	{
		document.execCommand('outdent', false, null);
	});
	
	this.addButton('geIcon geSprite geSprite-indent', mxResources.get('increaseIndent'), function()
	{
		document.execCommand('indent', false, null);
	});
	
	this.addSeparator();
	this.addItems(['link', 'image']);

	this.addButton('geIcon geSprite geSprite-horizontalrule', mxResources.get('insertHorizontalRule'), function()
	{
		document.execCommand('inserthorizontalrule', false, null);
	});
	
	// KNOWN: All table stuff does not work with undo/redo
	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	var elt = this.addMenuFunction('geIcon geSprite geSprite-table', mxResources.get('table'), false, mxUtils.bind(this, function(menu)
	{
		var elt = graph.getSelectedElement();
		var cell = graph.getParentByName(elt, 'TD', graph.cellEditor.text2);
		var row = graph.getParentByName(elt, 'TR', graph.cellEditor.text2);

		if (row == null)
    	{
			this.editorUi.menus.addInsertTableItem(menu);
    	}
		else
    	{
			var table = graph.getParentByName(row, 'TABLE', graph.cellEditor.text2);

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertColumn(table, (cell != null) ? cell.cellIndex : 0));
			}), null, 'geIcon geSprite geSprite-insertcolumnbefore');
			elt.setAttribute('title', mxResources.get('insertColumnBefore'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertColumn(table, (cell != null) ? cell.cellIndex + 1 : -1));
			}), null, 'geIcon geSprite geSprite-insertcolumnafter');
			elt.setAttribute('title', mxResources.get('insertColumnAfter'));

			elt = menu.addItem('Delete column', null, mxUtils.bind(this, function()
			{
				if (cell != null)
				{
					graph.deleteColumn(table, cell.cellIndex);
				}
			}), null, 'geIcon geSprite geSprite-deletecolumn');
			elt.setAttribute('title', mxResources.get('deleteColumn'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertRow(table, row.sectionRowIndex));
			}), null, 'geIcon geSprite geSprite-insertrowbefore');
			elt.setAttribute('title', mxResources.get('insertRowBefore'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertRow(table, row.sectionRowIndex + 1));
			}), null, 'geIcon geSprite geSprite-insertrowafter');
			elt.setAttribute('title', mxResources.get('insertRowAfter'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.deleteRow(table, row.sectionRowIndex);
			}), null, 'geIcon geSprite geSprite-deleterow');
			elt.setAttribute('title', mxResources.get('deleteRow'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				// Converts rgb(r,g,b) values
				var color = table.style.borderColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });
				this.editorUi.pickColor(color, function(newColor)
				{
					if (newColor == null || newColor == mxConstants.NONE)
					{
						table.removeAttribute('border');
						table.style.border = '';
						table.style.borderCollapse = '';
					}
					else
					{
						table.setAttribute('border', '1');
						table.style.border = '1px solid ' + newColor;
						table.style.borderCollapse = 'collapse';
					}
				});
			}), null, 'geIcon geSprite geSprite-strokecolor');
			elt.setAttribute('title', mxResources.get('borderColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				// Converts rgb(r,g,b) values
				var color = table.style.backgroundColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });
				this.editorUi.pickColor(color, function(newColor)
				{
					if (newColor == null || newColor == mxConstants.NONE)
					{
						table.style.backgroundColor = '';
					}
					else
					{
						table.style.backgroundColor = newColor;
					}
				});
			}), null, 'geIcon geSprite geSprite-fillcolor');
			elt.setAttribute('title', mxResources.get('backgroundColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				var value = table.getAttribute('cellPadding') || 0;
				
				var dlg = new FilenameDialog(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue)
				{
					if (newValue != null && newValue.length > 0)
					{
						table.setAttribute('cellPadding', newValue);
					}
					else
					{
						table.removeAttribute('cellPadding');
					}
				}), mxResources.get('spacing'));
				this.editorUi.showDialog(dlg.container, 300, 80, true, true);
				dlg.init();
			}), null, 'geIcon geSprite geSprite-fit');
			elt.setAttribute('title', mxResources.get('spacing'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'left');
			}), null, 'geIcon geSprite geSprite-left');
			elt.setAttribute('title', mxResources.get('left'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'center');
			}), null, 'geIcon geSprite geSprite-center');
			elt.setAttribute('title', mxResources.get('center'));
				
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'right');
			}), null, 'geIcon geSprite geSprite-right');
			elt.setAttribute('title', mxResources.get('right'));
    	}
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-removeformat', mxResources.get('removeFormat'), function()
	{
		document.execCommand('removeformat', false, null);
	});
	
	this.addButton('geIcon geSprite geSprite-code', mxResources.get('html'), function()
	{
		graph.cellEditor.toggleViewMode();
	});
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.hideMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
		this.currentMenu.destroy();
	}
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name, c)
{
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, menu.funct, c);
	
	menu.addListener('stateChanged', function()
	{
		elt.setEnabled(menu.enabled);
	});

	return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct, c)
{
	return this.addMenuFunctionInContainer((c != null) ? c : this.container, label, tooltip, showLabels, funct);
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunctionInContainer = function(container, label, tooltip, showLabels, funct)
{
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct);
	container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function(c)
{
	c = (c != null) ? c : this.container;
	var elt = document.createElement('div');
	elt.className = 'geSeparator';
	c.appendChild(elt);
	
	return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function(keys, c, ignoreDisabled)
{
	var items = [];
	
	for (var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		
		if (key == '-')
		{
			items.push(this.addSeparator(c));
		}
		else
		{
			items.push(this.addItem('geSprite-' + key.toLowerCase(), key, c, ignoreDisabled));
		}
	}
	
	return items;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function(sprite, key, c, ignoreDisabled)
{
	var action = this.editorUi.actions.get(key);
	var elt = null;
	
	if (action != null)
	{
		elt = this.addButton(sprite, action.label, action.funct, c);

		if (!ignoreDisabled)
		{
			elt.setEnabled(action.enabled);
			
			action.addListener('stateChanged', function()
			{
				elt.setEnabled(action.enabled);
			});
		}
	}
	
	return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function(classname, tooltip, funct, c)
{
	var elt = this.createButton(classname);
	c = (c != null) ? c : this.container;
	
	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	c.appendChild(elt);
	
	return elt;
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function(elt, tooltip)
{
	// Adds tooltip
	if (tooltip != null)
	{
		elt.setAttribute('title', tooltip);
	}

	this.addEnabledState(elt);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addEnabledState = function(elt)
{
	var classname = elt.className;
	
	elt.setEnabled = function(value)
	{
		elt.enabled = value;
		
		if (value)
		{
			elt.className = classname;
		}
		else
		{
			elt.className = classname + ' mxDisabled';
		}
	};
	
	elt.setEnabled(true);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addClickHandler = function(elt, funct)
{
	if (funct != null)
	{
		mxEvent.addListener(elt, 'click', function(evt)
		{
			if (elt.enabled)
			{
				funct(evt);
			}
			
			mxEvent.consume(evt);
		});
		
		if (document.documentMode != null && document.documentMode >= 9)
		{
			// Prevents focus
			mxEvent.addListener(elt, 'mousedown', function(evt)
			{
				evt.preventDefault();
			});
		}
	}
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function(classname)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geButton';

	var inner = document.createElement('div');
	
	if (classname != null)
	{
		inner.className = 'geSprite ' + classname;
	}
	
	elt.appendChild(inner);
	
	return elt;
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createLabel = function(label, tooltip)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geLabel';
	mxUtils.write(elt, label);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.addMenuHandler = function(elt, showLabels, funct, showAll)
{
	if (funct != null)
	{
		var graph = this.editorUi.editor.graph;
		var menu = null;
		var show = true;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			if (show && (elt.enabled == null || elt.enabled))
			{
				graph.popupMenuHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' geToolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;
				
				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.currentMenu = menu;
				this.currentElt = elt;
				
				// Extends destroy to reset global state
				menu.addListener(mxEvent.EVENT_HIDE, mxUtils.bind(this, function()
				{
					this.currentElt = null;
				}));
			}
			
			show = true;
			mxEvent.consume(evt);
		}));

		// Hides menu if already showing
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function(evt)
		{
			show = this.currentElt != elt;
			
			// Prevents focus
			if (document.documentMode != null && document.documentMode >= 9)
			{
				evt.preventDefault();
			}
		}));
	}
};
