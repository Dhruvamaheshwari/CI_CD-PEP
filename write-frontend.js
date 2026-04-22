const fs = require('fs');

const appJsxCode = `import { useState, useEffect } from 'react'
import { Check, Trash2, Plus } from 'lucide-react'

function App() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')

  useEffect(() => {
    fetch('/api/todos').then(res => res.json()).then(setTodos)
  }, [])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newText.trim()) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    })
    const newTodo = await res.json()
    setTodos([...todos, newTodo])
    setNewText('')
  }

  const toggleTodo = async (id) => {
    const res = await fetch(\`/api/todos/\${id}/toggle\`, { method: 'PATCH' })
    if (res.ok) {
      const updated = await res.json()
      setTodos(todos.map(t => t.id === id ? updated : t))
    }
  }

  const deleteTodo = async (id) => {
    await fetch(\`/api/todos/\${id}\`, { method: 'DELETE' })
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your daily goals.</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No tasks found. Create one above.</p>
            ) : (
              todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={\`group flex items-center justify-between p-3 rounded-md border transition-all \${
                    todo.completed ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-200 hover:border-slate-300'
                  }\`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={\`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors \${
                        todo.completed 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'border-slate-300 hover:border-slate-400'
                      }\`}
                    >
                      {todo.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={\`text-sm truncate \${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}\`}>
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;

const indexCssCode = \`@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
\`;

fs.writeFileSync('frontend/src/App.jsx', appJsxCode);
fs.writeFileSync('frontend/src/index.css', indexCssCode);
