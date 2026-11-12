import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

type Priority = 'high' | 'medium' | 'low';
type Category = '仕事' | 'プライベート' | '買い物' | '学習' | 'その他';

interface Todo {
  id: string;
  title: string;
  category: Category;
  dueDate: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

const CATEGORIES: Category[] = ['仕事', 'プライベート', '買い物', '学習', 'その他'];

const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const STORAGE_KEY = 'pastel-blue-todo-tasks-v1';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load todos', e);
    }
    return [
      {
        id: '1',
        title: 'プロジェクト企画書の作成',
        category: '仕事',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'high',
        completed: false,
        createdAt: Date.now() - 100000,
      },
      {
        id: '2',
        title: '牛乳と卵を買う',
        category: '買い物',
        dueDate: '',
        priority: 'medium',
        completed: false,
        createdAt: Date.now() - 50000,
      },
      {
        id: '3',
        title: 'TypeScriptの型定義を復習する',
        category: '学習',
        dueDate: '',
        priority: 'low',
        completed: true,
        createdAt: Date.now() - 20000,
      },
    ];
  });

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('仕事');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority');
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos', e);
    }
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: trimmed,
      category,
      dueDate,
      priority,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setTitle('');
    setDueDate('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (hideCompleted && todo.completed) return false;
        if (selectedCategory !== 'すべて' && todo.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (sortBy === 'priority') {
          const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (diff !== 0) return diff;
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return b.createdAt - a.createdAt;
      });
  }, [todos, selectedCategory, sortBy, hideCompleted]);

  const isOverdue = (dateStr: string, completed: boolean) => {
    if (!dateStr || completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const remainingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* ヘッダー */}
        <header className="app-header">
          <div>
            <h1 className="app-title">My Tasks</h1>
            <p className="app-subtitle">
              残り <strong>{remainingCount}</strong> 件のタスク
            </p>
          </div>
          {completedCount > 0 && (
            <button onClick={clearCompleted} className="btn-clear">
              完了済みを削除 ({completedCount})
            </button>
          )}
        </header>

        {/* タスク追加フォーム */}
        <form onSubmit={handleAddTodo} className="todo-form">
          <div className="input-row">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="新しいタスクを入力..."
              className="input-title"
              required
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-add"
              aria-label="タスクを追加"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>追加</span>
            </button>
          </div>

          <div className="options-grid">
            <div className="option-field">
              <label>カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="select-box"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="option-field">
              <label>優先度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="select-box"
              >
                <option value="high">高 (High)</option>
                <option value="medium">中 (Medium)</option>
                <option value="low">低 (Low)</option>
              </select>
            </div>

            <div className="option-field option-date">
              <label>期限日</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-date"
              />
            </div>
          </div>
        </form>

        {/* フィルター & ソートバー */}
        <div className="controls-section">
          <div className="category-tabs">
            {['すべて', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`tab-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-row">
            <div className="sort-select-wrap">
              <span className="sort-label">並び替え:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'priority' | 'dueDate' | 'createdAt')
                }
                className="select-mini"
              >
                <option value="priority">優先度順</option>
                <option value="dueDate">期限が近い順</option>
                <option value="createdAt">追加が新しい順</option>
              </select>
            </div>

            <label className="checkbox-hide">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
              />
              <span>完了を隠す</span>
            </label>
          </div>
        </div>

        {/* タスクリスト */}
        <main className="todo-list">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="empty-state">
              <p>表示するタスクがありません</p>
            </div>
          ) : (
            filteredAndSortedTodos.map((todo) => {
              const overdue = isOverdue(todo.dueDate, todo.completed);
              return (
                <div
                  key={todo.id}
                  className={`todo-card ${todo.completed ? 'is-completed' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`check-btn ${todo.completed ? 'checked' : ''}`}
                    aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                  >
                    {todo.completed && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <div className="todo-content">
                    <div className="todo-title">{todo.title}</div>
                    <div className="todo-badges">
                      <span className={`badge badge-priority-${todo.priority}`}>
                        優先度: {PRIORITY_LABELS[todo.priority]}
                      </span>
                      <span className="badge badge-category">{todo.category}</span>
                      {todo.dueDate && (
                        <span className={`badge badge-date ${overdue ? 'overdue' : ''}`}>
                          📅 {todo.dueDate} {overdue && '(期限切れ)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-btn"
                    aria-label="タスクを削除"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}