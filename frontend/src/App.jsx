import { useState, useEffect } from 'react'
import { Check, Trash2, Plus } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')

  useEffect(() => {
    axios.get(API_URL).then(res => setTodos(res.data))
  }, [])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newText.trim()) return
    const res = await axios.post(API_URL, { text: newText })
    setTodos([...todos, res.data])
    setNewText('')
  }

  const toggleTodo = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}/toggle`)
      setTodos(todos.map(t => t.id === id ? res.data : t))
    } catch (error) {
      console.error(error)
    }
  }

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your daily priorities.</p>
        </div>

        <div className="p-6 bg-white">
          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No tasks left! You're all caught up.</p>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className={`group flex items-center justify-between p-3 rounded-md border transition-all ${todo.completed ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-5 h-5 flex-shrink-0 rounded-md border flex items-center justify-center transition-colors ${todo.completed
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                    >
                      {todo.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`text-sm truncate select-none ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 ml-2 outline-none p-1 rounded hover:bg-red-50"
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
