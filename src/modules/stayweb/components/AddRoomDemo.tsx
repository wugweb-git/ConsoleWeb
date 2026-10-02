import { useState } from 'react';
import { Plus } from 'lucide-react';

export interface AddRoomDemoProps {
  onClose: () => void;
}

export function AddRoomDemo({ onClose }: AddRoomDemoProps) {
  const [newRoom, setNewRoom] = useState({ number: '', type: '', price: '', capacity: '' });

  const handleAddRoom = () => {
    console.log('Room added:', newRoom);
    onClose();
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-8 max-w-md w-full">
        <h2 className="text-foreground mb-6">Add New Room</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-card-foreground mb-2 block">Room Number</label>
            <input 
              type="text" 
              value={newRoom.number}
              onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input-background text-foreground"
              placeholder="e.g., 101"
            />
          </div>
          
          <div>
            <label className="text-card-foreground mb-2 block">Room Type</label>
            <select 
              value={newRoom.type}
              onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input-background text-foreground"
            >
              <option value="">Select type</option>
              <option value="private">Private Room</option>
              <option value="dorm">Dorm Room</option>
            </select>
          </div>
          
          <div>
            <label className="text-card-foreground mb-2 block">Price per Night (₹)</label>
            <input 
              type="number" 
              value={newRoom.price}
              onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input-background text-foreground"
              placeholder="e.g., 1500"
            />
          </div>
          
          <div>
            <label className="text-card-foreground mb-2 block">Capacity (Beds)</label>
            <input 
              type="number" 
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input-background text-foreground"
              placeholder="e.g., 6"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-border text-card-foreground rounded-lg hover:bg-muted transition-all">
            Cancel
          </button>
          <button
            onClick={handleAddRoom}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
}