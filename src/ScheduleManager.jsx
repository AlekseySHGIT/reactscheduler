import React, { useState } from 'react';
import { CalendarClock, Plus, AlertTriangle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const PERSONS = [
  { id: 1, name: 'John Smith', color: '#FFB3BA' },
  { id: 2, name: 'Jane Doe', color: '#BAFFC9' },
  { id: 3, name: 'Mike Johnson', color: '#BAE1FF' },
  { id: 4, name: 'Sarah Wilson', color: '#FFFFBA' }
];

export default function ScheduleManager() {
  const [view, setView] = useState('list');
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    person: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  const checkOverlap = (schedule) => {
    const newStart = new Date(`${schedule.startDate}T${schedule.startTime}`);
    const newEnd = new Date(`${schedule.endDate}T${schedule.endTime}`);
    
    const existingSchedules = schedules.map(existing => {
      return {
        startTime: new Date(`${existing.startDate}T${existing.startTime}`),
        endTime: new Date(`${existing.endDate}T${existing.endTime}`),
        person: existing.person
      };
    });

    for (let existing of existingSchedules) {
      const isSameDay = newStart.toDateString() === existing.endTime.toDateString() ||
                       newEnd.toDateString() === existing.startTime.toDateString();
                       
      if (isSameDay && newStart < existing.endTime) {
        return existing.endTime;
      }
    }
    
    return null;
  };

  const handleAddSchedule = () => {
    if (!newSchedule.person || !newSchedule.startDate || !newSchedule.startTime || 
        !newSchedule.endDate || !newSchedule.endTime) {
      setError('Please fill in all fields');
      return;
    }

    const startDateTime = new Date(`${newSchedule.startDate}T${newSchedule.startTime}`);
    const endDateTime = new Date(`${newSchedule.endDate}T${newSchedule.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    const conflictTime = checkOverlap(newSchedule);
    if (conflictTime) {
      setError(`Please select a time after ${conflictTime.toLocaleTimeString()}`);
      return;
    }

    setSchedules([...schedules, { ...newSchedule, id: Date.now() }]
      .sort((a, b) => {
        const dateA = new Date(`${a.startDate}T${a.startTime}`);
        const dateB = new Date(`${b.startDate}T${b.startTime}`);
        return dateB - dateA;
      })
    );
    setNewSchedule({
      person: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    });
    setError('');
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const CalendarCell = ({ day }) => {
    if (!day) return <div className="p-1 md:p-2 bg-gray-50" />;

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const schedulesForDay = schedules.filter(schedule => {
      const cellDate = new Date(dateStr);
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      return cellDate >= startDate && cellDate <= endDate;
    });

    return (
      <div className="p-2 border min-h-[100px] bg-white">
        <div className="font-medium mb-1">{day}</div>
        <div className="space-y-1">
          {schedulesForDay.map(schedule => (
            <div
              key={schedule.id}
              className="text-xs p-1 rounded"
              style={{ backgroundColor: PERSONS.find(p => p.name === schedule.person)?.color }}
            >
              <div className="font-medium">{schedule.person}</div>
              <div>{schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="text-center font-medium text-gray-500 p-2">{day}</div>
          ))}
          {days.map((day, i) => (
            <CalendarCell key={i} day={day} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
     <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
  <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
    <CalendarClock className="w-5 h-5 md:w-6 md:h-6" />
    Расписание
  </h1>
  <div className="flex gap-2">
    <button
      onClick={() => setView('list')}
      className={`px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base ${
        view === 'list' ? 'bg-blue-500 text-white' : 'bg-white border'
      }`}
    >
      List
    </button>
    <button
      onClick={() => setView('calendar')}
      className={`px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base ${
        view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-white border'
      }`}
    >
      Calendar
    </button>
  </div>
</div>
 
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
  {/* Form grid - changes from 50% width to full width on mobile */}
  <div className="grid grid-cols-1 w-full md:w-3/4 gap-4 mb-4">
    {/* Person select - full width on mobile */}
    <select
      className="w-full p-2 border rounded"
      value={newSchedule.person}
      onChange={(e) => setNewSchedule({ ...newSchedule, person: e.target.value })}
    >
      <option value="">Select Person</option>
      {PERSONS.map(person => (
        <option key={person.id} value={person.name}>{person.name}</option>
      ))}
    </select>
    
    {/* Date/Time inputs - stack on mobile */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input
        type="date"
        className="w-full p-2 border rounded"
        value={newSchedule.startDate}
        onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
      />
      <input
        type="time"
        className="w-full p-2 border rounded"
        value={newSchedule.startTime}
        onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input
        type="date"
        className="w-full p-2 border rounded"
        value={newSchedule.endDate}
        onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
      />
      <input
        type="time"
        className="w-full p-2 border rounded"
        value={newSchedule.endTime}
        onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
      />
    </div>
  </div>
</div>

      {view === 'list' ? (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Person</th>
                <th className="text-left p-4">Start Date/Time</th>
                <th className="text-left p-4">End Date/Time</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No schedules yet
                  </td>
                </tr>
              ) : (
                schedules.map(schedule => (
                  <tr key={schedule.id} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PERSONS.find(p => p.name === schedule.person)?.color }}
                        />
                        {schedule.person}
                      </div>
                    </td>
                    <td className="p-4">
                      {new Date(`${schedule.startDate}T${schedule.startTime}`).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {new Date(`${schedule.endDate}T${schedule.endTime}`).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}