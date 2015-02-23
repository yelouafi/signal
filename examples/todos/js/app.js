var ss = window.ss, _ = ss._, $ = ss.$, todos = window.todos;

var todoList = $('#todo-list'),
	todoInput = $('#new-todo'),
	toggleAll = $('#toggle-all').$click(),
	addTodo = todoInput.$keyCode(13),
	
	newTodo = ss.obj({ text: addTodo.map(todoInput.getter('value')) }),
	removeTodo = todoList.signal('li', '$removeTodo').map('.detail.data'),
	sortTodos = $('.sort').$click(),
	
	ttodo = $.t('todo', function(data) {
	    var input = this.$('.edit'),
	        toggle = this.$('.toggle'),
	        label = this.$('.label'),
	        inputValue = input.getter('value'),
	        
	        edit = label.$dblclick(),
	        save = input.$keyCode(13),
	        cancel = input.$keyCode(27),
	        completed = toggle.$checked(),
	        editing = ss.bstate(false, edit, ss.merge(save, cancel)),
	        title = input.$value(),
	        prevTitle = ss.def(data, [edit, inputValue]);
	        
		return { 
			css: { completed: completed, editing: editing },
			    '>.view': { visible: editing.not() },
			        '>.label': { text: title },
			    '>.edit': {
			        visible: editing,
			        value: ss.def( data, 
			            [save, inputValue],
			            [cancel, prevTitle]
			        )
			    },
			$removeTodo: this.$('.remove').$click().map(inputValue)
		};
	}),
	mTodos = todoList(newTodo, removeTodo, sortTodos);
	


$('#main', { visible: mTodos.length });

var textError = ss.bstate(false, mTodos.addInvalid, mTodos.addValid).log('text error: ');
$(todoInput, {
	value: mTodos.addValid.val(''),
	css: { error: textError },
	focus: mTodos.addValid
});

$(todoList, { 
	children: ttodo.collect(mTodos.data)
});
