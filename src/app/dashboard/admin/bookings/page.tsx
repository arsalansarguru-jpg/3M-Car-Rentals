"use client";

import React, { useState } from "react";
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { format, addDays, startOfToday } from "date-fns";
import { Search, Calendar as CalendarIcon, Clock, Filter, SlidersHorizontal, Plus } from "lucide-react";

// Mock Data
const vehicles = [
  { id: "v1", name: "BMW X5", category: "Luxury SUV", plate: "MH 01 AB 1234" },
  { id: "v2", name: "Audi A6", category: "Luxury Sedan", plate: "MH 02 CD 5678" },
  { id: "v3", name: "Toyota Fortuner", category: "SUV", plate: "MH 04 EF 9012" },
  { id: "v4", name: "Honda City", category: "Sedan", plate: "MH 43 GH 3456" },
  { id: "v5", name: "Maruti Swift", category: "Hatchback", plate: "MH 47 IJ 7890" },
];

const initialBookings = [
  { id: "b1", vehicleId: "v1", customer: "Rahul Sharma", startDay: 0, duration: 3, status: "active" },
  { id: "b2", vehicleId: "v2", customer: "Priya Desai", startDay: 2, duration: 2, status: "confirmed" },
  { id: "b3", vehicleId: "v3", customer: "Amit Patel", startDay: 1, duration: 4, status: "active" },
  { id: "b4", vehicleId: "v4", customer: "Neha Gupta", startDay: 4, duration: 2, status: "pending" },
];

const today = startOfToday();
const timelineDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

// Draggable Booking Block
function DraggableBooking({ booking, onWidth }: { booking: any, onWidth: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
    data: booking,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    width: `calc(${booking.duration * 100}% - 8px)`,
    left: `calc(${booking.startDay * 100}% + 4px)`,
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.8 : 1,
  };

  const statusColors: any = {
    active: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    confirmed: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    pending: "bg-amber-500/20 border-amber-500/30 text-amber-300"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute top-2 bottom-2 rounded-lg border p-2 cursor-grab active:cursor-grabbing shadow-lg backdrop-blur-md transition-shadow ${statusColors[booking.status]}`}
    >
      <div className="font-bold text-xs truncate text-white">{booking.customer}</div>
      <div className="text-[10px] truncate opacity-80 uppercase tracking-widest">{booking.status}</div>
    </div>
  );
}

// Droppable Cell (Day/Vehicle intersection)
function DroppableCell({ vehicleId, dayIndex, children }: { vehicleId: string, dayIndex: number, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${vehicleId}-${dayIndex}`,
    data: { vehicleId, dayIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-20 border-b border-r border-white/5 transition-colors ${isOver ? 'bg-white/10' : ''}`}
    >
      {children}
    </div>
  );
}

export default function BookingsTimeline() {
  const [bookings, setBookings] = useState(initialBookings);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeBookingId = active.id as string;
      const overData = over.data.current as { vehicleId: string, dayIndex: number };
      
      setBookings((prev) => prev.map((b) => {
        if (b.id === activeBookingId) {
          // Calculate max duration based on remaining days
          const maxAllowedDuration = 7 - overData.dayIndex;
          return {
            ...b,
            vehicleId: overData.vehicleId,
            startDay: overData.dayIndex,
            // Automatically trim booking if it overflows the 7-day view (simplified logic)
            duration: Math.min(b.duration, maxAllowedDuration)
          };
        }
        return b;
      }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Smart Booking Timeline</h1>
          <p className="text-white/50 text-sm mt-1">Drag and drop bookings to reassign vehicles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search bookings..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 bg-[#3B82F6] text-black px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" /> New Booking
          </button>
        </div>
      </div>

      <div className="bg-[#0f1115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Timeline Header (Days) */}
        <div className="flex border-b border-white/10 bg-white/5">
          <div className="w-64 shrink-0 border-r border-white/10 p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Fleet (5)</span>
            <SlidersHorizontal className="w-4 h-4 text-white/30" />
          </div>
          <div className="flex-1 grid grid-cols-7">
            {timelineDays.map((day, i) => (
              <div key={i} className={`p-4 border-r border-white/5 text-center ${i === 0 ? 'bg-[#3B82F6]/10' : ''}`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${i === 0 ? 'text-[#3B82F6]' : 'text-white/40'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-black ${i === 0 ? 'text-[#3B82F6]' : 'text-white'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex flex-col relative">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="flex group">
                {/* Vehicle Column */}
                <div className="w-64 shrink-0 border-r border-b border-white/5 p-4 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors relative z-20">
                  <h4 className="font-bold text-white text-sm">{vehicle.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-mono">{vehicle.plate}</span>
                    <span className="text-[10px] text-[#3B82F6] uppercase font-bold tracking-wider">{vehicle.category}</span>
                  </div>
                </div>
                
                {/* Days Columns */}
                <div className="flex-1 grid grid-cols-7 relative group-hover:bg-white/[0.02] transition-colors">
                  {timelineDays.map((_, dayIndex) => (
                    <DroppableCell key={dayIndex} vehicleId={vehicle.id} dayIndex={dayIndex}>
                      {/* We only render the booking inside the cell corresponding to its startDay */}
                      {bookings.filter(b => b.vehicleId === vehicle.id && b.startDay === dayIndex).map(booking => (
                        <DraggableBooking key={booking.id} booking={booking} onWidth={1} />
                      ))}
                    </DroppableCell>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50"></div>
          <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
          <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Pending</span>
        </div>
      </div>
    </div>
  );
}
