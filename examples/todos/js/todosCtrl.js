var ss = window.ss, _ = ss._, $ = ss.$;

var ENTER_KEY = 13,
	ESC_KEY = 27,
	uuid = 0;


function todoApp() {
    
    var me = this,
        ttodo = me.template('#ttodo'),
        inputValue	    = me.$('#new-todo').getter('value'),
    	toggleAll	    = me.$('#toggle-all').$checked(),
    	inputEnter	    = me.$('#new-todo').$keyCode(ENTER_KEY),
    	filter		    = $window.signal('hashchange').map(function() { return window.location.hash.substr(2) || 'all' }).keep('all'),
    	archive		    = me.$('#clear-completed').$click(),
    	addTodo         = inputEnter.filter(/\S+/).map(newTodo),
    	removeTodo      = me.signal('li', '$removeTodo').map('.detail.data'),
    	updateTodo      = me.signal('li', '$updateTodo').map('.detail.data'),
    	startEditing    = me.signal('li', '$startEditing').map('.detail.data'),
    	cancelEditing   = me.signal('li', '$cancelEditing').map('.detail.data'),
    	saveEditing     = me.signal('li', '$saveEditing').map('.detail.data'),
    	editingTodo     = ss.def(0, [startEditing, _.id], [cancelEditing.merge(saveEditing), 0]),
    	
        mTodos          = todosModel([]),
        cTodos          = ss.def([],
                            [addTodo, mTodos.addTodo],
                            [removeTodo, mTodos.removeTodo],
                            [updateTodo, mTodos.updateTodo],
                            [archive, mTodos.clearCompletedTodos],
                            [toggleAll, mTodos.toggleAll]
                        ).name('cTodos'),
        filteredTodos   = ss.map(filter, cTodos, mTodos.filteredTodos),
        activeCount     = cTodos.map(mTodos.activeCount),
        completedCount  = cTodos.map(mTodos.completedCount),
        length          = cTodos.map('.length');
    
    //Dom config
    me.$('#main',{ visible: length });
    me.$('#footer', {
        css: ss.obj({ hide: length.not() }) 
    });
    me.$('#toggle-all', { checked: completedCount.eq(0) });
    me.$('#remainingCount', { text: activeCount });
    me.$('#remainingLabel', { text: activeCount.map(itemsLabel) });
    me.$('#completedCount', { text: completedCount });
    me.$('#new-todo', { value: inputEnter.val('') });
    me.$('#todo-list', { children: $.tmap(todoCtrl, filteredTodos, 'id') });
    me.$$('#filters a', function() {
        var me = this;
    	$(this, {
    		css: ss.obj({ selected: filter.eq(me.data('filter')) })	
    	});
    });
    
    function newTodo() {
        return { id: ++uuid, title: inputValue().trim() };
    }
    
    function itemsLabel(count) {
        return count === 1 ? 'item' : 'items'
    }
    
    
    function todoCtrl(data) {
        var me          = ttodo(),
            label       = me.$('.label'),
            toggle      = me.$('.toggle'),
            destroy     = me.$('.destroy'),
            edit        = me.$('.edit'),
            
            editStart   = label.$dblclick(),
            editSave    = edit.$keyCode(ENTER_KEY),
            editCancel  = edit.$keyCode(ESC_KEY),
            
            todoC       = {
                    	    id: data.id,
                    	    title: ss.def(data.title,
                    	        [editSave, edit.prop('value')],
                    	        [editCancel, function(cur, prev) { return prev; }]
                    	    ),
                    	    completed: toggle.$checked().merge(toggleAll)
                        },
            editing     = editingTodo.eq(data.id),
            notEditing  = editing.not();
        
        $(me, {
        	css: ss.obj({ 
        	    completed: todoC.completed, 
        	    editing: editing
        	}),
        	$removeTodo     : destroy.$click().val(data.id),
        	$updateTodo     : ss.obj(todoC),
        	$startEditing   : editStart.val(data.id),
        	$saveEditing    : editSave.val(data.id),
        	$cancelEditing  : editCancel.merge(edit.$blur()).val(data.id)
        	
        });
        
        $(label, { 
            text: todoC.title ,
            visible: notEditing
        });
        $(toggle, {
            checked: toggleAll,
            visible: notEditing
        });
        $(edit, { 
            visible: editing,
            value: todoC.title,
            focus: editStart
        });
        
        return me;
    }
    
}