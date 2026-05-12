import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


// Custom CSS to match Cal.PNG and cal2.PNG style
const calendarStyles = `
  .custom-calendar {
    width: 100% !important;
    border: none !important;
    font-family: inherit !important;
  }
  .react-calendar__navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1.2rem;
    font-weight: 600;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.8rem;
    padding-bottom: 10px;
    border-bottom: 1px dashed #cbd5e1;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }
  .react-calendar__tile {
    padding: 1.2rem 0.5rem !important;
    background: none;
    text-align: center;
    line-height: 1.2;
    font-size: 1rem;
    transition: all 0.2s;
  }
  /* Matching Cal.PNG blue selection */
  .react-calendar__tile--active {
    background: #2563eb !important; 
    color: white !important;
    border-radius: 4px;
  }
  .react-calendar__tile--now {
    background: #f1f5f9 !important;
    border-radius: 4px;
  }
  /* Red text for Friday/Saturday ONLY - Not Sunday */
  .holiday-text {
    color: #ef4444 !important;
    font-weight: 600;
  }
  .react-calendar__tile:enabled:hover {
    background-color: #f3f4f6 !important;
    border-radius: 4px;
  }
`;

export default function AppCalendar() {
  const [value, setValue] = useState(new Date());

  // Complete Holiday List for Bangladesh
  const holidayList = [
    { date: "01-01", name: "New Year's Day" },
    { date: "01-10", name: "Bangabandhu Homecoming Day" },
    { date: "01-17", name: "Shab-e-Meraj" },
    { date: "01-23", name: "Saraswati Puja" },
    { date: "02-01", name: "Maghi Purnima" },
    { date: "02-04", name: "Shab-e-Barat" },
    { date: "02-11", name: "Election Day" },
    { date: "02-12", name: "Election Day Holiday" },
    { date: "02-14", name: "Valentine's Day" },
    { date: "02-15", name: "Maha Shivaratri" },
    { date: "02-18", name: "Ash Wednesday" },
    { date: "02-19", name: "Ramadan Start" },
    { date: "02-21", name: "Language Martyrs' Day" },
    { date: "03-02", name: "National Flag Day" },
    { date: "03-03", name: "Holi" },
    { date: "03-17", name: "Shab-e-qadr" },
    { date: "03-19", name: "Eid ul-Fitr Holiday" },
    { date: "03-20", name: "Jummatul Bidah" },
    { date: "03-21", name: "Eid ul-Fitr" },
    { date: "03-22", name: "Eid ul-Fitr Holiday" },
    { date: "03-26", name: "Independence Day" },
    { date: "04-02", name: "Maundy Thursday" },
    { date: "04-03", name: "Good Friday" },
    { date: "04-04", name: "Holy Saturday" },
    { date: "04-05", name: "Easter Day" },
    { date: "04-06", name: "Easter Monday" },
    { date: "04-13", name: "Chaitra Sankranti" },
    { date: "04-14", name: "Bengali New Year" },
    { date: "05-01", name: "May Day" },
    { date: "05-02", name: "Buddha Purnima Holiday" },
    { date: "05-10", name: "Mothers' Day" },
    { date: "05-25", name: "Eid al-Adha Holiday" },
    { date: "05-27", name: "Eid al-Adha Holiday" },
    { date: "05-28", name: "Eid al-Adha" },
    { date: "05-30", name: "Eid al-Adha Holiday" },
    { date: "05-31", name: "Eid al-Adha Holiday" },
    { date: "06-01", name: "Eid al-Adha Holiday" },
    { date: "06-17", name: "Muharam" },
    { date: "06-21", name: "Father's Day" },
    { date: "06-26", name: "Ashura" },
    { date: "07-01", name: "July 1 Bank Holiday" },
    { date: "07-29", name: "Ashani Purnima" },
    { date: "08-05", name: "Student-People Uprising Day" },
    { date: "08-12", name: "Anant Chatani Somba" },
    { date: "08-26", name: "Eid al-Milad-un-Nabi" },
    { date: "09-04", name: "Janmashtami" },
    { date: "09-24", name: "Fatehā-Yādigāh" },
    { date: "09-26", name: "Madhu Purnima" },
    { date: "10-10", name: "Maharaya" },
    { date: "10-18", name: "Durga Puja Holiday" },
    { date: "10-19", name: "Kartikeya" },
    { date: "10-20", name: "Mahanavami" },
    { date: "10-21", name: "Durga Puja" },
    { date: "10-25", name: "Lakshmi Puja" },
    { date: "10-26", name: "Prabharans Purnima" },
    { date: "10-31", name: "Hallowe'en" },
    { date: "11-07", name: "National Revolution and Solidarity Day" },
    { date: "11-08", name: "Sri Shanpai Puja" },
    { date: "12-16", name: "Victory Day" },
    { date: "12-24", name: "Christmas Eve" },
    { date: "12-25", name: "Christmas Day" },
    { date: "12-26", name: "Boxing Day" },
    { date: "12-31", name: "New Year's Eve" }
  ];

  // Check if date is Friday or Saturday ONLY (NOT Sunday)
  const isHoliday = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    
    // Check specific holidays
    const foundHoliday = holidayList.find(h => h.date === dateStr);
    console.log("foundHoliday : ", foundHoliday)
    
    // Highlight ONLY Friday (5) and Saturday (6) as weekends
    // Sunday (0) is NOT a weekend - treated as normal working day
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;

    console.log("IsWeekend name :",isWeekend)

    return foundHoliday || isWeekend;
  };

  // Get holiday name or day type
  const getHolidayName = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    
    const foundHoliday = holidayList.find(h => h.date === dateStr);
    const dayOfWeek = date.getDay();
    
    // Only Friday (5) and Saturday (6) are weekends
    // Sunday (0) is NOT a weekend
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    if (foundHoliday) {
      return foundHoliday.name;
    } else if (isWeekend) {
      return dayOfWeek === 5 ? "Friday (Weekend)" : "Saturday (Weekend)";
    }
    return "Working Day";
  };


  const tileClassName = ({ date, view }) => {
    if (view === 'month' && isHoliday(date)) {
      return 'holiday-text';
    }
    return null;
  };




  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-10 flex flex-col items-center">
      <style>{calendarStyles}</style>
      
      <div className="card w-full max-w-md bg-base-100 shadow-2xl p-6 rounded-xl">
        <div className="flex flex-col items-center mb-4 text-center">
          <h2 className="text-xl font-bold text-primary mb-1">Schedule</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Official Calendar</p>
        </div>

        <Calendar
          onChange={setValue}
          value={value}
          tileClassName={tileClassName}
          className="custom-calendar"
          next2Label={null}
          prev2Label={null}
        />

        <div className="divider mt-6 text-xs opacity-50 uppercase">Event Details</div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
            <div className="bg-primary text-primary-content h-14 w-14 flex flex-col items-center justify-center rounded-xl font-black shadow-lg">
              <span className="text-lg leading-none">{value.getDate()}</span>
              <span className="text-[10px] uppercase">{value.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            </div>
            <div>
              <p className="font-bold text-gray-700">
                {value.toLocaleDateString('en-BD', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm font-medium text-blue-600">
                {getHolidayName(value)}
              </p>
            </div>
          </div>
          
          <button className="btn btn-primary btn-block btn-sm shadow-md">Add Event</button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span>Friday & Saturday (Weekends)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}