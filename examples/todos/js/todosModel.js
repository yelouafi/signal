var _ = ss._;

function todosModel(array) {
    
    function addTodo(todo) {
        array.push(todo);
        return array;
    }
    
    function removeTodo(id) {
        _.removeAll(array, function(t) {
            return t.id === id;
        });
    }
    
    function clearCompletedTodos() {
        _.removeAll(array, isCompleted);
    }
    
    function toggleAll(toggle) {
        _.each(array, function(t) {
            t.completed = toggle;
        });
        return array;
    }
    
    function filteredTodos(filter) {
        if(filter === 'all') return array;
        if(filter === 'completed') return _.filter(array, isCompleted);
        if(filter === 'active') return _.filter(array, isActive);
    }
    
    
    function isActive(todo) {
        return !todo.completed;
    }
    
    function isCompleted(todo) {
        return todo.completed;
    }
    
    return {
        addTodo: addTodo,
        removeTodo: removeTodo,
        clearCompletedTodos: clearCompletedTodos,
        filteredTodos: filteredTodos
    }
}

function todoItemModel(id, title) {
    var data = { id: id, title: title, completed: false };
    
    function setCompleted(isCompleted) {
        data.completed = isCompleted;
        return data;
    }
    
    function setTitle(title) {
        data.title = title;
        return data;
    }
    
    return {
        data: data,
        setCompleted: setCompleted,
        setTitle: setTitle
    };
    
}