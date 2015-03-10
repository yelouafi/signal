var _ = ss._;

function todosModel() {
    
    function addTodo(todo, array) {
        array.push(todo);
        return array;
    }
    
    function removeTodo(id, array) {
        _.removeAll(array, todoById(id));
        return array;
    }
    
    function updateTodo(data, array) {
        var idx = _.first(array, todoById(data.id));
        if(idx >= 0) {
            var todo = array[idx];
            _.eachKey(data, function(val, key) {
               todo[key] = val; 
            });
        }
        return array;
    }
    
    function clearCompletedTodos(__, array) {
        _.removeAll(array, isCompleted);
        return array;
    }
    
    function toggleAll(toggle, array) {
        _.each(array, function(t) {
            t.completed = toggle;
        });
        return array;
    }
    
    function filteredTodos(filter, array) {
        if(filter === 'all') return array;
        if(filter === 'completed') return _.filter(array, isCompleted);
        if(filter === 'active') return _.filter(array, isActive);
    }
    
    function activeCount(array) {
        return _.count(array, isActive);
    }
    
    function completedCount(array) {
        return _.count(array, isActive);
    }
    
    function allCompleted(array) {
        return _.all(array, isCompleted);
    }
    
    function todoById(id) {
        return function(t) {
            return t.id === id;
        }
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
        updateTodo: updateTodo,
        clearCompletedTodos: clearCompletedTodos,
        filteredTodos: filteredTodos,
        activeCount: activeCount,
        toggleAll: toggleAll,
        completedCount: completedCount,
        allCompleted: allCompleted
    }
}