import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Appointment, Doctor } from '../types';
import { Clock, Calendar, Video, MapPin, Plus, X, Check, AlertTriangle } from 'lucide-react';

const Appointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    doctorId: string;
    date: string;
    time: string;
    virtual: boolean;
    notes: string;
  }>({
    doctorId: '',
    date: '',
    time: '',
    virtual: true,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [currentUser]);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', currentUser?.uid),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      const appointmentsData: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Appointment;
        appointmentsData.push({
          ...data,
          id: doc.id
        });
      });
      
      setAppointments(appointmentsData);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      // For demo purposes, add some sample appointments if Firestore fetch fails
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const sampleAppointments: Appointment[] = [
        {
          id: '1',
          userId: currentUser?.uid || 'sample-user',
          doctorId: '1',
          doctorName: 'Dr. Sarah Johnson',
          specialization: 'Gynecologist',
          date: nextWeek.toISOString().split('T')[0],
          time: '10:00 AM',
          status: 'scheduled',
          virtual: true,
          meetingLink: 'https://meet.example.com/dr-sarah'
        },
        {
          id: '2',
          userId: currentUser?.uid || 'sample-user',
          doctorId: '3',
          doctorName: 'Dr. Emily Chen',
          specialization: 'Nutritionist',
          date: tomorrow.toISOString().split('T')[0],
          time: '2:30 PM',
          status: 'scheduled',
          virtual: false
        }
      ];
      
      setAppointments(sampleAppointments);
      
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDoctors = async () => {
    try {
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('available', '==', true)
      );
      
      const querySnapshot = await getDocs(doctorsQuery);
      const doctorsData: Doctor[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Doctor;
        doctorsData.push({
          ...data,
          id: doc.id
        });
      });
      
      setDoctors(doctorsData);
      
      if (doctorsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctorId: doctorsData[0].id
        }));
      }
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      
      // For demo purposes, add some sample doctors if Firestore fetch fails
      const sampleDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialization: 'Gynecologist',
          experience: 12,
          rating: 4.8,
          photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          availability: {
            '2025-06-15': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM'],
            '2025-06-16': ['10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'],
            '2025-06-17': ['9:00 AM', '1:00 PM', '2:00 PM', '3:00 PM']
          }
        },
        {
          id: '2',
          name: 'Dr. Michael Rodriguez',
          specialization: 'Endocrinologist',
          experience: 15,
          rating: 4.7,
          photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          availability: {
            '2025-06-15': ['10:00 AM', '11:00 AM', '1:00 PM'],
            '2025-06-16': ['9:00 AM', '10:00 AM', '4:00 PM'],
            '2025-06-18': ['11:00 AM', '1:00 PM', '2:00 PM']
          }
        },
        {
          id: '3',
          name: 'Dr. Emily Chen',
          specialization: 'Nutritionist',
          experience: 8,
          rating: 4.9,
          photoURL: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          availability: {
            '2025-06-15': ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'],
            '2025-06-17': ['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'],
            '2025-06-19': ['9:00 AM', '10:00 AM', '11:00 AM', '3:00 PM']
          }
        }
      ];
      
      setDoctors(sampleDoctors);
      
      if (sampleDoctors.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctorId: sampleDoctors[0].id
        }));
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (!formData.doctorId || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const selectedDoctor = doctors.find(doctor => doctor.id === formData.doctorId);
      
      if (!selectedDoctor) {
        setError('Selected doctor not found');
        return;
      }
      
      const appointmentData: Omit<Appointment, 'id'> = {
        userId: currentUser.uid,
        doctorId: formData.doctorId,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date: formData.date,
        time: formData.time,
        status: 'scheduled',
        notes: formData.notes,
        virtual: formData.virtual,
        meetingLink: formData.virtual ? `https://meet.example.com/${formData.doctorId}` : undefined
      };
      
      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Reset form and show success message
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        virtual: true,
        notes: ''
      });
      
      setSuccess('Appointment scheduled successfully!');
      setTimeout(() => {
        setSuccess('');
        setShowForm(false);
      }, 3000);
      
      // Refresh appointments
      fetchAppointments();
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const cancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      });
      
      // Refresh appointments
      fetchAppointments();
      
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getAvailableTimes = () => {
    if (!formData.doctorId || !formData.date) return [];
    
    const selectedDoctor = doctors.find(doctor => doctor.id === formData.doctorId);
    if (!selectedDoctor) return [];
    
    return selectedDoctor.availability[formData.date] || [];
  };
  
  const getAvailableDates = () => {
    if (!formData.doctorId) return [];
    
    const selectedDoctor = doctors.find(doctor => doctor.id === formData.doctorId);
    if (!selectedDoctor) return [];
    
    return Object.keys(selectedDoctor.availability).sort();
  };
  
  const isUpcoming = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    return appointmentDate > now;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Schedule Appointment
              </>
            )}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule New Appointment</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor *
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date *
                </label>
                <select
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a date</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time *
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a time</option>
                  {getAvailableTimes().map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="virtual"
                      name="virtual"
                      type="checkbox"
                      checked={formData.virtual}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="virtual" className="ml-2 block text-sm text-gray-700">
                      Virtual Appointment
                    </label>
                  </div>
                  {formData.virtual && (
                    <p className="text-sm text-gray-500">
                      You will receive a meeting link via email before your appointment.
                    </p>
                  )}
                  {!formData.virtual && (
                    <p className="text-sm text-gray-500">
                      In-person appointment at our clinic. Address details will be sent via email.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  placeholder="Briefly describe your reason for the appointment or any specific concerns..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.filter(appointment => 
              appointment.status === 'scheduled' && 
              isUpcoming(appointment.date, appointment.time)
            ).length > 0 ? (
              appointments
                .filter(appointment => 
                  appointment.status === 'scheduled' && 
                  isUpcoming(appointment.date, appointment.time)
                )
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(appointment => (
                  <div key={appointment.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start">
                        <div className="mr-4 flex-shrink-0">
                          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{appointment.doctorName}</h3>
                          <p className="text-gray-600">{appointment.specialization}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            {appointment.virtual ? (
                              <>
                                <Video className="h-4 w-4 mr-1" />
                                <span>Virtual Appointment</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>In-person Appointment</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        {appointment.virtual && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center mb-2"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </a>
                        )}
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Calendar className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No upcoming appointments</h3>
                <p className="text-gray-600">
                  You don't have any scheduled appointments. Click "Schedule Appointment" to book a consultation.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Past & Cancelled Appointments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.filter(appointment => 
              appointment.status === 'cancelled' || 
              (appointment.status === 'scheduled' && !isUpcoming(appointment.date, appointment.time))
            ).length > 0 ? (
              appointments
                .filter(appointment => 
                  appointment.status === 'cancelled' || 
                  (appointment.status === 'scheduled' && !isUpcoming(appointment.date, appointment.time))
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(appointment => (
                  <div key={appointment.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start">
                        <div className="mr-4 flex-shrink-0">
                          <div className={`h-16 w-16 rounded-full ${
                            appointment.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                          } flex items-center justify-center`}>
                            {appointment.status === 'cancelled' ? (
                              <X className="h-8 w-8 text-red-600" />
                            ) : (
                              <Check className="h-8 w-8 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-800">{appointment.doctorName}</h3>
                            {appointment.status === 'cancelled' && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{appointment.specialization}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            {appointment.virtual ? (
                              <>
                                <Video className="h-4 w-4 mr-1" />
                                <span>Virtual Appointment</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>In-person Appointment</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600">No past or cancelled appointments.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Important Information</h2>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p>
              Please arrive 15 minutes before your scheduled in-person appointment time. For virtual appointments, ensure you have a stable internet connection and join the meeting 5 minutes early.
            </p>
            <p>
              If you need to cancel or reschedule, please do so at least 24 hours in advance to avoid any cancellation fees.
            </p>
            <p>
              For urgent medical concerns, please contact emergency services or visit your nearest emergency room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;