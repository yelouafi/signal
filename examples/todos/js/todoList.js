
function todoList(newTodo, remove, sort) {
	
	var todos = ss.def([],
		
		[add, function(todo) { 
			return todos().concat(todo);
		}],
		
		[remove, function(todo) { 
			var arr = todos().slice(); 
			_.remove(arr, todo); 
			return arr;
		}],
		
		[sort, function () {
			return _.sort(todos().slice(), 'text');
		}]
	);
	return {
		data: todos,
		length: todos.map('.length') 
	}
}