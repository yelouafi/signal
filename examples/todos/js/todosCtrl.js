var ss = window.ss, _ = ss._, $ = ss.$;

var ENTER_KEY = 13,
	ESC_KEY = 27,
	uuid = 0;


function todoApp() {
    var me = this,
        inputValue	= me.$('#new-todo').getter('value'),
    	toggleAll	= me.$('#toggle-all').$checked(),
    	inputEnter	= me.$('#new-todo').$keyCode(ENTER_KEY),
    	filter		= ss.def( 'all',
    	    [ me.$('#filters').$click('a')    , _.fapply('.target.dataset.filter') ]),
    	archive		= me.$('#clear-completed').$click(),
    	addTodo = inputEnter.filter(function() { return inputValue().trim()})
    						.map(function() {
    						    return { id: ++uuid, title: inputValue() };
    						}),
    	removeTodo = me.signal('li', '$removeTodo').map('.detail.data'),
    	toggleTodo = me.signal('li', '$toggleTodo').map('.detail.data').log('toggle todo'),
        mTodos = todosModel([]),
        cTodos = ss.def([],
            [addTodo, mTodos.addTodo],
            [removeTodo, mTodos.removeTodo],
            [archive, mTodos.clearCompletedTodos],
            [toggleAll, mTodos.toggleAll]
        ),
        
        
    me.$('#main', { visible: todosLength });
    me.$('#footer', 	{ visible: todosLength });
    me.$('#remainingCount', { text: activeCount });
    me.$('#remainingLabel', { 
    	text: activeCount.map(function(count) { return count === 1 ? 'item' : 'items' })
    });
    me.$('#completedCount', { text: completedCount });
    me.$('#new-todo', {
    	value: inputEnter.val('')
    });
    me.$('#todo-list', { 
    	children: cTodos.map(function(mTodos) {
    	    return _.map(mTodos, _.propGetter('$$relm'));
    	})
    });
    
    me.$$('#filters a', function() {
        var me = this;
    	$(this, {
    		css: { selected: filter.eq(me.data('filter')) }	
    	});
    });
    
    function todoActive(t) { 
        return !t.completed;
    }
    function todoCompleted(t) {
        return t.completed;
    }
    
    var ttodo = me.template('#ttodo');
    function todoCtrl(data) {
        var me = ttodo();
        var completed = me.$('.toggle').$checked().merge(toggleAll);
        $(me, {
        	css: { 
        	    completed: completed, 
        	    editing: false
        	},
        	$removeTodo: me.$('.destroy').$click().val(data.id),
        	$toggle: me.$('.toggle').$checked()
        });
        
        me.$('.label', { text: data.title });
        me.$('.toggle', { checked: toggleAll });
        
        return me;
    }
    
}