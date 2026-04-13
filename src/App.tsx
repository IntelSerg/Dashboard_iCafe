/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  MoreVertical, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Mail, 
  Send,
  User,
  Settings,
  LogOut,
  Filter,
  ArrowUpRight,
  Printer,
  Camera,
  Wrench,
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type TaskStatus = 'new' | 'in-progress' | 'waiting-payment' | 'completed' | 'delivered';
type TaskSource = 'telegram' | 'whatsapp' | 'vk' | 'email' | 'walk-in';
type ServiceType = 'print' | 'photo' | 'repair' | 'editing' | 'consultation' | 'tacho' | 'other';

interface Task {
  id: string;
  clientName: string;
  source: TaskSource;
  serviceType: ServiceType;
  status: TaskStatus;
  createdAt: string;
  deadline: string;
  description: string;
  attachments: { name: string; type: 'file' | 'image' | 'audio' }[];
  priority: 'low' | 'medium' | 'high';
}

// --- Mock Data ---

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    clientName: 'Иван Петров',
    source: 'telegram',
    serviceType: 'print',
    status: 'new',
    createdAt: '2024-04-12T10:30:00Z',
    deadline: '2024-04-12T11:00:00Z',
    description: 'Распечатать 50 страниц PDF, ч/б, двухсторонняя печать.',
    attachments: [{ name: 'document.pdf', type: 'file' }],
    priority: 'medium',
  },
  {
    id: '2',
    clientName: 'Мария Сидорова',
    source: 'vk',
    serviceType: 'photo',
    status: 'in-progress',
    createdAt: '2024-04-12T09:15:00Z',
    deadline: '2024-04-12T12:00:00Z',
    description: 'Фото на загранпаспорт, 4 шт. Нужна ретушь.',
    attachments: [{ name: 'raw_photo.jpg', type: 'image' }],
    priority: 'high',
  },
  {
    id: '3',
    clientName: 'Алексей Волков',
    source: 'email',
    serviceType: 'editing',
    status: 'waiting-payment',
    createdAt: '2024-04-11T16:45:00Z',
    deadline: '2024-04-13T10:00:00Z',
    description: 'Отредактировать дипломную работу, исправить форматирование по ГОСТу.',
    attachments: [{ name: 'diploma_v1.docx', type: 'file' }],
    priority: 'low',
  },
  {
    id: '4',
    clientName: 'Пенсионерка Анна Ивановна',
    source: 'walk-in',
    serviceType: 'consultation',
    status: 'completed',
    createdAt: '2024-04-12T11:00:00Z',
    deadline: '2024-04-12T11:30:00Z',
    description: 'Помочь записаться к врачу через Госуслуги.',
    attachments: [],
    priority: 'medium',
  },
  {
    id: '5',
    clientName: 'Сергей К.',
    source: 'whatsapp',
    serviceType: 'repair',
    status: 'new',
    createdAt: '2024-04-12T12:00:00Z',
    deadline: '2024-04-15T18:00:00Z',
    description: 'Замена экрана на iPhone 13. Запчасть заказана.',
    attachments: [{ name: 'voice_note.mp3', type: 'audio' }],
    priority: 'high',
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const styles = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
    'waiting-payment': 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delivered: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels = {
    new: 'Новая',
    'in-progress': 'В работе',
    'waiting-payment': 'Ожидает оплаты',
    completed: 'Готово',
    delivered: 'Выдано',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const SourceIcon = ({ source }: { source: TaskSource }) => {
  switch (source) {
    case 'telegram': return <Send className="w-4 h-4 text-sky-500" />;
    case 'whatsapp': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    case 'vk': return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    case 'email': return <Mail className="w-4 h-4 text-rose-500" />;
    case 'walk-in': return <User className="w-4 h-4 text-slate-500" />;
    default: return null;
  }
};

const ServiceIcon = ({ type }: { type: ServiceType }) => {
  switch (type) {
    case 'print': return <Printer className="w-4 h-4" />;
    case 'photo': return <Camera className="w-4 h-4" />;
    case 'repair': return <Wrench className="w-4 h-4" />;
    case 'editing': return <FileText className="w-4 h-4" />;
    case 'consultation': return <GraduationCap className="w-4 h-4" />;
    case 'tacho': return <CreditCard className="w-4 h-4" />;
    default: return <MoreVertical className="w-4 h-4" />;
  }
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === 'active') {
        return matchesSearch && task.status !== 'delivered' && task.status !== 'completed';
      }
      if (activeTab === 'completed') {
        return matchesSearch && (task.status === 'delivered' || task.status === 'completed');
      }
      return matchesSearch;
    });
  }, [tasks, searchQuery, activeTab]);

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status !== 'delivered' && t.status !== 'completed').length,
    urgent: tasks.filter(t => t.priority === 'high' && t.status !== 'delivered').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AdminFlow</h1>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
              <LayoutDashboard className="w-4 h-4" />
              Дашборд
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
              Сообщения
              <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <User className="w-4 h-4" />
              Клиенты
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Настройки
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Админ</p>
              <p className="text-xs text-slate-500">Смена: День</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors">
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск по клиентам или задачам..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all relative">
              <Clock className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
              <Plus className="w-4 h-4" />
              Новая задача
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-400">Всего сегодня</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">+12% к вчерашнему дню</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-400">В работе</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500 mt-1">Среднее время: 15 мин</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-400">Срочные</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.urgent}</p>
              <p className="text-xs text-rose-500 mt-1">Требуют внимания</p>
            </motion.div>
          </div>

          {/* Tasks Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900">Список задач</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Активные
                  </button>
                  <button 
                    onClick={() => setActiveTab('completed')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Завершенные
                  </button>
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Все
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                <Filter className="w-4 h-4" />
                Фильтры
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Клиент</th>
                    <th className="px-6 py-4">Услуга</th>
                    <th className="px-6 py-4">Источник</th>
                    <th className="px-6 py-4">Статус</th>
                    <th className="px-6 py-4">Дедлайн</th>
                    <th className="px-6 py-4">Файлы</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                      <motion.tr 
                        key={task.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {task.clientName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{task.clientName}</p>
                              <p className="text-[11px] text-slate-400">ID: {task.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <ServiceIcon type={task.serviceType} />
                            <span className="text-sm">
                              {task.serviceType === 'print' && 'Печать'}
                              {task.serviceType === 'photo' && 'Фото'}
                              {task.serviceType === 'repair' && 'Ремонт'}
                              {task.serviceType === 'editing' && 'Правки'}
                              {task.serviceType === 'consultation' && 'Помощь'}
                              {task.serviceType === 'tacho' && 'Тахограф'}
                              {task.serviceType === 'other' && 'Прочее'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <SourceIcon source={task.source} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock className={`w-3.5 h-3.5 ${task.priority === 'high' ? 'text-rose-500' : 'text-slate-400'}`} />
                            {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {task.attachments.map((att, i) => (
                              <div key={i} className="w-6 h-6 rounded border border-white bg-slate-100 flex items-center justify-center shadow-sm">
                                {att.type === 'image' && <ImageIcon className="w-3 h-3 text-slate-500" />}
                                {att.type === 'file' && <FileText className="w-3 h-3 text-slate-500" />}
                                {att.type === 'audio' && <Mic className="w-3 h-3 text-slate-500" />}
                              </div>
                            ))}
                            {task.attachments.length === 0 && <span className="text-xs text-slate-300">—</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Задачи не найдены</p>
                  <p className="text-sm text-slate-400">Попробуйте изменить параметры поиска или фильтры</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SourceIcon source={selectedTask.source} />
                  <h3 className="font-bold text-slate-900">Детали задачи #{selectedTask.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Клиент</span>
                    <StatusBadge status={selectedTask.status} />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {selectedTask.clientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedTask.clientName}</p>
                      <p className="text-sm text-slate-500">Постоянный клиент • 12 заказов</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Описание задачи</span>
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <p className="text-slate-700 leading-relaxed">{selectedTask.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Вложения ({selectedTask.attachments.length})</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTask.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group">
                        <div className="p-2 bg-slate-100 rounded group-hover:bg-white transition-colors">
                          {att.type === 'image' && <ImageIcon className="w-4 h-4 text-slate-500" />}
                          {att.type === 'file' && <FileText className="w-4 h-4 text-slate-500" />}
                          {att.type === 'audio' && <Mic className="w-4 h-4 text-slate-500" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-900 truncate">{att.name}</p>
                          <p className="text-[10px] text-slate-400">1.2 MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">История действий</span>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Задача создана</p>
                        <p className="text-[10px] text-slate-400">12.04.2024, 10:30 • Автоматически из Telegram</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Статус изменен на "В работе"</p>
                        <p className="text-[10px] text-slate-400">12.04.2024, 10:45 • Администратор</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">
                  Печать чека
                </button>
                <button className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
                  Завершить задачу
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
