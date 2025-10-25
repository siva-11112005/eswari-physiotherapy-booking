// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, User, Mail, Phone, Lock, LogOut, Edit, Trash2, Shield, CheckCircle, XCircle, Users } from 'lucide-react';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
// // Mock Backend Service (In production, replace with actual API calls)
// const BackendService = {
//   users: [
//     { id: 1, email: 'admin@eswari.com', password: 'admin123', name: 'Eswari', role: 'admin' }
//   ],
//   bookings: [],
//   blockedUsers: [],

//   register: function(userData) {
//     const existingUser = this.users.find(u => u.email === userData.email);
//     if (existingUser) {
//       throw new Error('Email already registered');
//     }
//     const newUser = {
//       id: Date.now(),
//       ...userData,
//       role: 'client',
//       createdAt: new Date()
//     };
//     this.users.push(newUser);
//     return { success: true, user: { ...newUser, password: undefined } };
//   },

//   login: function(email, password) {
//     const user = this.users.find(u => u.email === email && u.password === password);
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }
//     return { success: true, user: { ...user, password: undefined } };
//   },

//   createBooking: function(bookingData) {
//     const isBlocked = this.blockedUsers.some(u => u.email === bookingData.email);
//     if (isBlocked) {
//       throw new Error('User is blocked from booking');
//     }
    
//     const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const booking = {
//       id: Date.now(),
//       ...bookingData,
//       verificationCode,
//       status: 'pending',
//       createdAt: new Date()
//     };
//     this.bookings.push(booking);
//     return { success: true, booking };
//   },

//   getBookings: function(userId, isAdmin) {
//     if (isAdmin) {
//       return this.bookings;
//     }
//     return this.bookings.filter(b => b.userId === userId);
//   },

//   updateBookingTime: function(bookingId, newTime, userId) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (!booking) {
//       throw new Error('Booking not found');
//     }
//     if (booking.userId !== userId) {
//       throw new Error('Unauthorized');
//     }
//     booking.time = newTime;
//     booking.timeChanged = true;
//     return { success: true, booking };
//   },

//   verifyBooking: function(bookingId) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (booking) {
//       booking.status = 'verified';
//     }
//     return { success: true };
//   },

//   cancelBooking: function(bookingId) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (booking) {
//       booking.status = 'cancelled';
//     }
//     return { success: true };
//   },

//   blockUser: function(email) {
//     const user = this.users.find(u => u.email === email);
//     if (user && !this.blockedUsers.find(u => u.email === email)) {
//       this.blockedUsers.push({ email, name: user.name, blockedAt: new Date() });
//     }
//     return { success: true };
//   },

//   unblockUser: function(email) {
//     this.blockedUsers = this.blockedUsers.filter(u => u.email !== email);
//     return { success: true };
//   }
// };

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [view, setView] = useState('home');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [bookings, setBookings] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [message, setMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     if (currentUser) {
//       loadBookings();
//     }
//   }, [currentUser]);

//   const loadBookings = () => {
//     const isAdmin = currentUser?.role === 'admin';
//     const allBookings = BackendService.getBookings(currentUser?.id, isAdmin);
//     setBookings(allBookings);
//   };

//   const generateTimeSlots = (date) => {
//     const slots = [];
//     const dateStr = date;
    
//     // Morning slots (10:00 - 13:00)
//     const morningSlots = ['10:00 AM', '11:00 AM', '12:00 PM'];
//     morningSlots.forEach(time => slots.push({ time, type: 'regular' }));
    
//     // Lunch
//     slots.push({ time: '01:00 PM', type: 'lunch' });
    
//     // Afternoon slots (14:00 - 17:00)
//     const afternoonSlots = ['02:00 PM', '03:00 PM', '04:00 PM'];
//     afternoonSlots.forEach(time => slots.push({ time, type: 'regular' }));
    
//     return slots;
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.login(formData.email, formData.password);
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Login successful!' });
//       setFormData({});
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleRegister = (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match' });
//       return;
//     }
//     try {
//       const result = BackendService.register({
//         email: formData.email,
//         password: formData.password,
//         name: formData.name,
//         phone: formData.phone
//       });
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Account created successfully!' });
//       setFormData({});
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleBooking = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.createBooking({
//         userId: currentUser.id,
//         email: currentUser.email,
//         name: currentUser.name,
//         phone: formData.phone || currentUser.phone,
//         date: selectedDate,
//         time: selectedSlot,
//         reason: formData.reason
//       });
//       setShowModal(false);
//       setMessage({ 
//         type: 'success', 
//         text: `Booking confirmed! Your verification code: ${result.booking.verificationCode}` 
//       });
//       loadBookings();
//       setFormData({});
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleTimeChange = (e) => {
//     e.preventDefault();
//     try {
//       BackendService.updateBookingTime(formData.bookingId, formData.newTime, currentUser.id);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Booking time updated successfully!' });
//       loadBookings();
//       setFormData({});
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const openModal = (type, slot = null) => {
//     setModalType(type);
//     setSelectedSlot(slot);
//     setShowModal(true);
//     setMessage({ type: '', text: '' });
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({});
//     setMessage({ type: '', text: '' });
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setView('home');
//     setBookings([]);
//   };

//   const isSlotBooked = (time) => {
//     return bookings.some(b => 
//       b.date === selectedDate && 
//       b.time === time && 
//       b.status !== 'cancelled'
//     );
//   };

//   const getDateString = () => {
//     const date = new Date(selectedDate + 'T00:00:00');
//     const day = date.getDay();
//     if (day === 0) return 'Sunday - Clinic Closed';
//     return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
//   };

//   // Header Component
//   const Header = () => (
//     <div style={{
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       color: 'white',
//       padding: '40px 20px',
//       textAlign: 'center',
//       boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
//     }}>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexWrap: 'wrap'
//       }}>
//         <div style={{ textAlign: 'left' }}>
//           <h1 style={{ fontSize: '2.5em', marginBottom: '10px', fontWeight: '700' }}>
//             Eswari Physiotherapy
//           </h1>
//           <p style={{ fontSize: '1.1em', opacity: '0.9' }}>Professional Care for Your Well-being</p>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//           {!currentUser ? (
//             <>
//               <button onClick={() => openModal('login')} style={buttonStyle}>
//                 <Lock size={18} /> Login
//               </button>
//               <button onClick={() => openModal('register')} style={{...buttonStyle, background: 'white', color: '#667eea'}}>
//                 <User size={18} /> Sign Up
//               </button>
//             </>
//           ) : (
//             <>
//               <span style={{ marginRight: '15px', fontSize: '1.1em' }}>
//                 Welcome, {currentUser.name}!
//               </span>
//               <button onClick={handleLogout} style={buttonStyle}>
//                 <LogOut size={18} /> Logout
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   // Hero Section with Image
//   const HeroSection = () => (
//     <div style={{
//       background: 'linear-gradient(rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9)), url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200)',
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       padding: '80px 20px',
//       textAlign: 'center',
//       color: 'white'
//     }}>
//       <h2 style={{ fontSize: '2.5em', marginBottom: '20px', fontWeight: '700' }}>
//         Expert Physiotherapy Services
//       </h2>
//       <p style={{ fontSize: '1.3em', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
//         Personalized treatment plans to help you recover, strengthen, and thrive
//       </p>
//     </div>
//   );

//   // Booking Calendar View
//   const BookingView = () => {
//     const date = new Date(selectedDate + 'T00:00:00');
//     const isSunday = date.getDay() === 0;
//     const slots = generateTimeSlots(selectedDate);

//     return (
//       <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '40px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#667eea', marginBottom: '30px', fontSize: '2em' }}>
//             <Calendar size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
//             Book Your Session
//           </h2>
          
//           <div style={{ marginBottom: '30px', textAlign: 'center' }}>
//             <label style={{ fontSize: '1.2em', marginRight: '15px', color: '#333' }}>
//               Select Date:
//             </label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               min={new Date().toISOString().split('T')[0]}
//               style={{
//                 padding: '12px 20px',
//                 fontSize: '1em',
//                 border: '2px solid #667eea',
//                 borderRadius: '10px'
//               }}
//             />
//             <div style={{ marginTop: '15px', fontSize: '1.1em', color: '#666' }}>
//               {getDateString()}
//             </div>
//           </div>

//           {isSunday ? (
//             <div style={{
//               textAlign: 'center',
//               padding: '60px',
//               background: '#ffebee',
//               borderRadius: '15px',
//               color: '#c62828',
//               fontSize: '1.3em'
//             }}>
//               Clinic is closed on Sundays
//             </div>
//           ) : (
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
//               gap: '20px'
//             }}>
//               {slots.map((slot, index) => {
//                 const booked = isSlotBooked(slot.time);
//                 const isLunch = slot.type === 'lunch';
                
//                 return (
//                   <div
//                     key={index}
//                     onClick={() => !booked && !isLunch && currentUser && openModal('booking', slot.time)}
//                     style={{
//                       padding: '25px',
//                       borderRadius: '15px',
//                       textAlign: 'center',
//                       cursor: !booked && !isLunch && currentUser ? 'pointer' : 'not-allowed',
//                       transition: 'all 0.3s',
//                       background: isLunch ? '#fff9e6' : booked ? '#ffebee' : '#e8f5e9',
//                       border: `3px solid ${isLunch ? '#ffc107' : booked ? '#dc3545' : '#28a745'}`,
//                       opacity: booked || isLunch ? 0.7 : 1,
//                       transform: 'scale(1)'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!booked && !isLunch && currentUser) {
//                         e.currentTarget.style.transform = 'scale(1.05)';
//                         e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'scale(1)';
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   >
//                     <Clock size={24} style={{ marginBottom: '10px', color: '#667eea' }} />
//                     <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '5px' }}>
//                       {slot.time}
//                     </div>
//                     <div style={{ fontSize: '0.9em', color: '#666' }}>
//                       {isLunch ? 'Lunch Break' : booked ? 'Booked' : 'Available'}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {!currentUser && !isSunday && (
//             <div style={{
//               marginTop: '30px',
//               padding: '20px',
//               background: '#e3f2fd',
//               borderRadius: '10px',
//               textAlign: 'center',
//               color: '#1565c0',
//               fontSize: '1.1em'
//             }}>
//               Please login or create an account to book a session
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // My Bookings View
//   const MyBookingsView = () => {
//     const myBookings = bookings.filter(b => b.userId === currentUser?.id);
//     const today = new Date().toISOString().split('T')[0];

//     return (
//       <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '40px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#667eea', marginBottom: '30px', fontSize: '2em' }}>
//             <Users size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
//             My Bookings
//           </h2>

//           {myBookings.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '1.2em' }}>
//               No bookings yet. Book your first session!
//             </div>
//           ) : (
//             <div style={{ display: 'grid', gap: '20px' }}>
//               {myBookings.map(booking => (
//                 <div
//                   key={booking.id}
//                   style={{
//                     padding: '25px',
//                     background: '#f8f9fa',
//                     borderRadius: '15px',
//                     borderLeft: `5px solid ${
//                       booking.status === 'verified' ? '#28a745' :
//                       booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
//                     }`
//                   }}
//                 >
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
//                     <div><strong>Date:</strong> {booking.date}</div>
//                     <div><strong>Time:</strong> {booking.time}</div>
//                     <div><strong>Status:</strong> <span style={{ 
//                       textTransform: 'uppercase', 
//                       color: booking.status === 'verified' ? '#28a745' : 
//                              booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
//                     }}>{booking.status}</span></div>
//                     <div><strong>Code:</strong> {booking.verificationCode}</div>
//                   </div>
//                   <div style={{ marginBottom: '15px' }}>
//                     <strong>Reason:</strong> {booking.reason || 'Not specified'}
//                   </div>
//                   {booking.timeChanged && (
//                     <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '8px', marginBottom: '10px' }}>
//                       Time has been changed
//                     </div>
//                   )}
//                   {booking.status !== 'cancelled' && booking.date === today && (
//                     <button
//                       onClick={() => {
//                         setFormData({ bookingId: booking.id, currentTime: booking.time });
//                         openModal('changeTime');
//                       }}
//                       style={{...buttonStyle, background: '#ffc107', color: '#333'}}
//                     >
//                       <Edit size={16} /> Change Time (Today Only)
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Admin Panel
//   const AdminPanel = () => {
//     const [adminView, setAdminView] = useState('bookings');

//     return (
//       <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '40px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#667eea', marginBottom: '30px', fontSize: '2em' }}>
//             <Shield size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
//             Admin Dashboard
//           </h2>

//           <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
//             {['bookings', 'blocked'].map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setAdminView(tab)}
//                 style={{
//                   padding: '15px 30px',
//                   background: 'transparent',
//                   border: 'none',
//                   borderBottom: `3px solid ${adminView === tab ? '#667eea' : 'transparent'}`,
//                   color: adminView === tab ? '#667eea' : '#666',
//                   fontSize: '1.1em',
//                   cursor: 'pointer',
//                   fontWeight: adminView === tab ? 'bold' : 'normal'
//                 }}
//               >
//                 {tab === 'bookings' ? 'All Bookings' : 'Blocked Users'}
//               </button>
//             ))}
//           </div>

//           {adminView === 'bookings' && (
//             <div>
//               {bookings.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
//                   No bookings yet
//                 </div>
//               ) : (
//                 <div style={{ display: 'grid', gap: '20px' }}>
//                   {bookings.map(booking => (
//                     <div
//                       key={booking.id}
//                       style={{
//                         padding: '25px',
//                         background: '#f8f9fa',
//                         borderRadius: '15px',
//                         borderLeft: `5px solid ${
//                           booking.status === 'verified' ? '#28a745' :
//                           booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
//                         }`
//                       }}
//                     >
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
//                         <div><strong>Name:</strong> {booking.name}</div>
//                         <div><strong>Email:</strong> {booking.email}</div>
//                         <div><strong>Phone:</strong> {booking.phone}</div>
//                         <div><strong>Date:</strong> {booking.date}</div>
//                         <div><strong>Time:</strong> {booking.time}</div>
//                         <div><strong>Code:</strong> {booking.verificationCode}</div>
//                       </div>
//                       <div style={{ marginBottom: '15px' }}>
//                         <strong>Reason:</strong> {booking.reason || 'Not specified'}
//                       </div>
//                       <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//                         {booking.status === 'pending' && (
//                           <>
//                             <button
//                               onClick={() => {
//                                 BackendService.verifyBooking(booking.id);
//                                 loadBookings();
//                                 setMessage({ type: 'success', text: 'Booking verified!' });
//                               }}
//                               style={{...buttonStyle, background: '#28a745'}}
//                             >
//                               <CheckCircle size={16} /> Verify
//                             </button>
//                             <button
//                               onClick={() => {
//                                 if (window.confirm('Cancel this booking?')) {
//                                   BackendService.cancelBooking(booking.id);
//                                   loadBookings();
//                                 }
//                               }}
//                               style={{...buttonStyle, background: '#dc3545'}}
//                             >
//                               <XCircle size={16} /> Cancel
//                             </button>
//                             <button
//                               onClick={() => {
//                                 if (window.confirm(`Block user ${booking.name}?`)) {
//                                   BackendService.blockUser(booking.email);
//                                   setMessage({ type: 'success', text: 'User blocked!' });
//                                 }
//                               }}
//                               style={{...buttonStyle, background: '#ffc107', color: '#333'}}
//                             >
//                               <Trash2 size={16} /> Block User
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {adminView === 'blocked' && (
//             <div>
//               {BackendService.blockedUsers.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
//                   No blocked users
//                 </div>
//               ) : (
//                 <div style={{ display: 'grid', gap: '20px' }}>
//                   {BackendService.blockedUsers.map((user, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         padding: '25px',
//                         background: '#ffebee',
//                         borderRadius: '15px',
//                         borderLeft: '5px solid #dc3545'
//                       }}
//                     >
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
//                         <div><strong>Name:</strong> {user.name}</div>
//                         <div><strong>Email:</strong> {user.email}</div>
//                         <div><strong>Blocked:</strong> {new Date(user.blockedAt).toLocaleDateString()}</div>
//                       </div>
//                       <button
//                         onClick={() => {
//                           if (window.confirm(`Unblock ${user.name}?`)) {
//                             BackendService.unblockUser(user.email);
//                             setMessage({ type: 'success', text: 'User unblocked!' });
//                             setView('admin'); // Force re-render
//                           }
//                         }}
//                         style={{...buttonStyle, background: '#28a745'}}
//                       >
//                         <CheckCircle size={16} /> Unblock
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Modal Component
//   const Modal = () => {
//     if (!showModal) return null;

//     return (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'rgba(0,0,0,0.7)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1000,
//         padding: '20px'
//       }}>
//         <div style={{
//           background: 'white',
//           padding: '40px',
//           borderRadius: '20px',
//           maxWidth: '500px',
//           width: '100%',
//           maxHeight: '90vh',
//           overflowY: 'auto'
//         }}>
//           <h2 style={{ color: '#667eea', marginBottom: '25px' }}>
//             {modalType === 'login' && 'Login to Your Account'}
//             {modalType === 'register' && 'Create New Account'}
//             {modalType === 'booking' && 'Confirm Your Booking'}
//             {modalType === 'changeTime' && 'Change Booking Time'}
//           </h2>

//           {message.text && (
//             <div style={{
//               padding: '15px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               background: message.type === 'success' ? '#d4edda' : '#f8d7da',
//               color: message.type === 'success' ? '#155724' : '#721c24'
//             }}>
//               {message.text}
//             </div>
//           )}

//           {modalType === 'login' && (
//             <form onSubmit={handleLogin}>
//               <div style={formGroupStyle}>
//                 <label><Mail size={18} /> Email</label>
//                 <input
//                   type="email"
//                   value={formData.email || ''}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label><Lock size={18} /> Password</label>
//                 <input
//                   type="password"
//                   value={formData.password || ''}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, flex: 1}}>
//                   Login
//                 </button>
//               </div>
//             </form>
//           )}

//           {modalType === 'register' && (
//             <form onSubmit={handleRegister}>
//               <div style={formGroupStyle}>
//                 <label><User size={18} /> Full Name</label>
//                 <input
//                   type="text"
//                   value={formData.name || ''}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label><Mail size={18} /> Email</label>
//                 <input
//                   type="email"
//                   value={formData.email || ''}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label><Phone size={18} /> Phone Number</label>
//                 <input
//                   type="tel"
//                   value={formData.phone || ''}
//                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label><Lock size={18} /> Password</label>
//                 <input
//                   type="password"
//                   value={formData.password || ''}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label><Lock size={18} /> Confirm Password</label>
//                 <input
//                   type="password"
//                   value={formData.confirmPassword || ''}
//                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, flex: 1}}>
//                   Create Account
//                 </button>
//               </div>
//             </form>
//           )}

//           {modalType === 'booking' && (
//             <form onSubmit={handleBooking}>
//               <div style={{
//                 padding: '20px',
//                 background: '#e3f2fd',
//                 borderRadius: '10px',
//                 marginBottom: '20px'
//               }}>
//                 <div><strong>Date:</strong> {selectedDate}</div>
//                 <div><strong>Time:</strong> {selectedSlot}</div>
//                 <div><strong>Duration:</strong> 50 minutes</div>
//               </div>
//               <div style={formGroupStyle}>
//                 <label>Phone Number (Optional)</label>
//                 <input
//                   type="tel"
//                   value={formData.phone || ''}
//                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                   style={inputStyle}
//                   placeholder={currentUser?.phone || 'Enter phone number'}
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label>Reason for Visit</label>
//                 <textarea
//                   value={formData.reason || ''}
//                   onChange={(e) => setFormData({...formData, reason: e.target.value})}
//                   style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
//                   placeholder="Describe your condition or reason for physiotherapy"
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, flex: 1}}>
//                   Confirm Booking
//                 </button>
//               </div>
//             </form>
//           )}

//           {modalType === 'changeTime' && (
//             <form onSubmit={handleTimeChange}>
//               <div style={{
//                 padding: '20px',
//                 background: '#fff3cd',
//                 borderRadius: '10px',
//                 marginBottom: '20px',
//                 color: '#856404'
//               }}>
//                 <strong>Note:</strong> You can only change the time for today's booking to another available slot.
//               </div>
//               <div style={formGroupStyle}>
//                 <label>Current Time: {formData.currentTime}</label>
//               </div>
//               <div style={formGroupStyle}>
//                 <label>Select New Time</label>
//                 <select
//                   value={formData.newTime || ''}
//                   onChange={(e) => setFormData({...formData, newTime: e.target.value})}
//                   style={inputStyle}
//                   required
//                 >
//                   <option value="">Choose a time slot</option>
//                   {generateTimeSlots(selectedDate).map((slot, index) => {
//                     if (slot.type === 'lunch') return null;
//                     const booked = isSlotBooked(slot.time) && slot.time !== formData.currentTime;
//                     return (
//                       <option key={index} value={slot.time} disabled={booked}>
//                         {slot.time} {booked ? '(Booked)' : ''}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//               <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, flex: 1}}>
//                   Change Time
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Navigation
//   const Navigation = () => {
//     if (!currentUser) return null;

//     return (
//       <div style={{
//         background: 'white',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         padding: '15px 20px'
//       }}>
//         <div style={{
//           maxWidth: '1200px',
//           margin: '0 auto',
//           display: 'flex',
//           gap: '20px',
//           justifyContent: 'center',
//           flexWrap: 'wrap'
//         }}>
//           <button
//             onClick={() => setView('booking')}
//             style={{
//               ...buttonStyle,
//               background: view === 'booking' ? '#667eea' : 'transparent',
//               color: view === 'booking' ? 'white' : '#667eea',
//               border: '2px solid #667eea'
//             }}
//           >
//             Book Session
//           </button>
//           <button
//             onClick={() => setView('mybookings')}
//             style={{
//               ...buttonStyle,
//               background: view === 'mybookings' ? '#667eea' : 'transparent',
//               color: view === 'mybookings' ? 'white' : '#667eea',
//               border: '2px solid #667eea'
//             }}
//           >
//             My Bookings
//           </button>
//           {currentUser?.role === 'admin' && (
//             <button
//               onClick={() => {
//                 setView('admin');
//                 loadBookings();
//               }}
//               style={{
//                 ...buttonStyle,
//                 background: view === 'admin' ? '#667eea' : 'transparent',
//                 color: view === 'admin' ? 'white' : '#667eea',
//                 border: '2px solid #667eea'
//               }}
//             >
//               <Shield size={18} /> Admin Panel
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
//       <Header />
//       {!currentUser && <HeroSection />}
//       <Navigation />
      
//       {message.text && (
//         <div style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           padding: '20px',
//           borderRadius: '10px',
//           background: message.type === 'success' ? '#d4edda' : '#f8d7da',
//           color: message.type === 'success' ? '#155724' : '#721c24',
//           boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
//           zIndex: 999,
//           maxWidth: '400px'
//         }}>
//           {message.text}
//         </div>
//       )}

//       {view === 'home' && !currentUser && <BookingView />}
//       {view === 'booking' && currentUser && <BookingView />}
//       {view === 'mybookings' && currentUser && <MyBookingsView />}
//       {view === 'admin' && currentUser?.role === 'admin' && <AdminPanel />}
      
//       <Modal />

//       {/* Footer */}
//       <div style={{
//         background: '#2c3e50',
//         color: 'white',
//         padding: '40px 20px',
//         marginTop: '60px',
//         textAlign: 'center'
//       }}>
//         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//           <h3 style={{ marginBottom: '20px' }}>Eswari Physiotherapy</h3>
//           <p style={{ marginBottom: '15px' }}>
//             <strong>Working Hours:</strong> Monday - Saturday
//           </p>
//           <p style={{ marginBottom: '15px' }}>
//             Morning: 10:00 AM - 1:00 PM | Afternoon: 2:00 PM - 5:00 PM
//           </p>
//           <p style={{ marginBottom: '15px' }}>
//             Each session: 50 minutes
//           </p>
//           <p style={{ opacity: 0.7, marginTop: '30px' }}>
//             © 2024 Eswari Physiotherapy. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Styles
// const buttonStyle = {
//   padding: '12px 24px',
//   background: '#667eea',
//   color: 'white',
//   border: 'none',
//   borderRadius: '10px',
//   cursor: 'pointer',
//   fontSize: '1em',
//   fontWeight: '500',
//   display: 'inline-flex',
//   alignItems: 'center',
//   gap: '8px',
//   transition: 'all 0.3s'
// };

// const formGroupStyle = {
//   marginBottom: '20px'
// };

// const inputStyle = {
//   width: '100%',
//   padding: '12px',
//   border: '2px solid #ddd',
//   borderRadius: '8px',
//   fontSize: '1em',
//   marginTop: '8px'
// };

// export default App;



// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, User, Mail, Phone, Lock, LogOut, Edit, Trash2, Shield, CheckCircle, XCircle, Users, Activity, Heart, Zap } from 'lucide-react';

// const BackendService = {
//   users: [
//     { id: 1, phone: '1234567890', email: 'admin@eswari.com', password: 'admin123', name: 'Eswari', role: 'admin' }
//   ],
//   bookings: [],
//   blockedUsers: [],

//   register: function(userData) {
//     const existingUser = this.users.find(u => u.phone === userData.phone || (userData.email && u.email === userData.email));
//     if (existingUser) {
//       throw new Error('Phone or Email already registered');
//     }
//     const newUser = {
//       id: Date.now(),
//       ...userData,
//       role: 'client',
//       createdAt: new Date()
//     };
//     this.users.push(newUser);
//     return { success: true, user: { ...newUser, password: undefined } };
//   },

//   login: function(identifier, password) {
//     const user = this.users.find(u => 
//       (u.email === identifier || u.phone === identifier) && u.password === password
//     );
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }
//     return { success: true, user: { ...user, password: undefined } };
//   },

//   createBooking: function(bookingData) {
//     const isBlocked = this.blockedUsers.some(u => u.phone === bookingData.phone);
//     if (isBlocked) {
//       throw new Error('User is blocked from booking');
//     }
    
//     const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const booking = {
//       id: Date.now(),
//       ...bookingData,
//       verificationCode,
//       status: 'pending',
//       createdAt: new Date()
//     };
//     this.bookings.push(booking);
//     return { success: true, booking };
//   },

//   getBookings: function(userId, isAdmin) {
//     if (isAdmin) {
//       return this.bookings;
//     }
//     return this.bookings.filter(b => b.userId === userId);
//   },

//   cancelBooking: function(bookingId, userId, isAdmin) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (!booking) {
//       throw new Error('Booking not found');
//     }
//     if (!isAdmin && booking.userId !== userId) {
//       throw new Error('Unauthorized');
//     }
//     booking.status = 'cancelled';
//     return { success: true, booking };
//   },

//   cancelAllBookings: function(date) {
//     const cancelled = this.bookings.filter(b => b.date === date && b.status !== 'cancelled');
//     cancelled.forEach(b => b.status = 'cancelled');
//     return { success: true, count: cancelled.length };
//   },

//   verifyBooking: function(bookingId) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (booking) {
//       booking.status = 'verified';
//     }
//     return { success: true };
//   },

//   blockUser: function(phone) {
//     const user = this.users.find(u => u.phone === phone);
//     if (user && !this.blockedUsers.find(u => u.phone === phone)) {
//       this.blockedUsers.push({ phone, name: user.name, blockedAt: new Date() });
//     }
//     return { success: true };
//   },

//   unblockUser: function(phone) {
//     this.blockedUsers = this.blockedUsers.filter(u => u.phone !== phone);
//     return { success: true };
//   }
// };

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [view, setView] = useState('home');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [bookings, setBookings] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [message, setMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     if (currentUser) {
//       loadBookings();
//     }
//   }, [currentUser]);

//   const loadBookings = () => {
//     const isAdmin = currentUser?.role === 'admin';
//     const allBookings = BackendService.getBookings(currentUser?.id, isAdmin);
//     setBookings(allBookings);
//   };

//   const generateTimeSlots = (date) => {
//     const slots = [];
//     const morningSlots = ['10:00 AM', '11:00 AM', '12:00 PM'];
//     morningSlots.forEach(time => slots.push({ time, type: 'regular' }));
    
//     slots.push({ time: '01:00 PM', type: 'lunch' });
    
//     const afternoonSlots = ['02:00 PM', '03:00 PM', '04:00 PM'];
//     afternoonSlots.forEach(time => slots.push({ time, type: 'regular' }));
    
//     return slots;
//   };

//   const getMaxDate = () => {
//     const today = new Date();
//     const maxDate = new Date(today);
//     maxDate.setDate(today.getDate() + 7);
//     return maxDate.toISOString().split('T')[0];
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.login(formData.identifier, formData.password);
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Login successful!' });
//       setFormData({});
//       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleRegister = (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match' });
//       return;
//     }
//     try {
//       const result = BackendService.register({
//         name: formData.name,
//         email: formData.email || undefined,
//         phone: formData.phone,
//         password: formData.password
//       });
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Account created successfully!' });
//       setFormData({});
//       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleBooking = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.createBooking({
//         userId: currentUser.id,
//         name: currentUser.name,
//         email: formData.email || currentUser.email,
//         phone: formData.phone || currentUser.phone,
//         date: selectedDate,
//         time: selectedSlot,
//         reason: formData.reason,
//         painType: formData.painType
//       });
//       setShowModal(false);
//       setMessage({ 
//         type: 'success', 
//         text: `Booking confirmed! Your verification code: ${result.booking.verificationCode}` 
//       });
//       loadBookings();
//       setFormData({});
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const openModal = (type, slot = null) => {
//     setModalType(type);
//     setSelectedSlot(slot);
//     setShowModal(true);
//     setMessage({ type: '', text: '' });
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({});
//     setMessage({ type: '', text: '' });
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setView('home');
//     setBookings([]);
//   };

//   const isSlotBooked = (time) => {
//     return bookings.some(b => 
//       b.date === selectedDate && 
//       b.time === time && 
//       b.status !== 'cancelled'
//     );
//   };

//   const painTypes = [
//     { name: 'Back Pain', icon: Activity, color: '#e74c3c' },
//     { name: 'Neck Pain', icon: Heart, color: '#3498db' },
//     { name: 'Knee Pain', icon: Zap, color: '#f39c12' },
//     { name: 'Shoulder Pain', icon: Activity, color: '#9b59b6' },
//     { name: 'Sports Injury', icon: Zap, color: '#2ecc71' },
//     { name: 'Other', icon: Heart, color: '#95a5a6' }
//   ];

//   const Header = () => (
//     <div style={{
//       background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
//       color: 'white',
//       padding: '20px 0',
//       boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//     }}>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         padding: '0 20px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexWrap: 'wrap',
//         gap: '15px'
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//           <Phone size={18} />
//           <span>+91-8888888888</span>
//           <Mail size={18} />
//           <span>websupport@justdial.com</span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           {!currentUser ? (
//             <>
//               <button onClick={() => openModal('login')} style={{...buttonStyle, background: 'white', color: '#e67e22', padding: '8px 20px'}}>
//                 Log In
//               </button>
//               <button onClick={() => openModal('register')} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}>
//                 Sign Up
//               </button>
//             </>
//           ) : (
//             <>
//               <span style={{ fontSize: '0.95em' }}>Welcome, {currentUser.name}!</span>
//               <button onClick={handleLogout} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}>
//                 <LogOut size={16} /> Logout
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const Navigation = () => (
//     <div style={{
//       background: 'white',
//       boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
//       padding: '15px 0',
//       position: 'sticky',
//       top: 0,
//       zIndex: 100
//     }}>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         padding: '0 20px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexWrap: 'wrap',
//         gap: '20px'
//       }}>
//         <h2 style={{ color: '#e67e22', fontSize: '1.8em', margin: 0 }}>
//           PAIN REHAB CLINIC
//         </h2>
//         <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
//           <a href="#" onClick={() => setView('home')} style={navLinkStyle}>HOME</a>
//           {currentUser && (
//             <>
//               <a href="#" onClick={() => setView('booking')} style={navLinkStyle}>BOOK APPOINTMENT</a>
//               <a href="#" onClick={() => setView('mybookings')} style={navLinkStyle}>MY BOOKINGS</a>
//               {currentUser.role === 'admin' && (
//                 <a href="#" onClick={() => { setView('admin'); loadBookings(); }} style={navLinkStyle}>ADMIN PANEL</a>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const HeroSection = () => (
//     <div style={{
//       background: `linear-gradient(rgba(230, 126, 34, 0.85), rgba(211, 84, 0, 0.85)), url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       padding: '120px 20px',
//       textAlign: 'left',
//       color: 'white'
//     }}>
//       <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//         <h1 style={{ fontSize: '3em', marginBottom: '20px', fontWeight: '700', lineHeight: '1.2' }}>
//           A Specialized Physiotherapy Clinic
//         </h1>
//         <p style={{ fontSize: '1.3em', marginBottom: '40px', maxWidth: '600px' }}>
//           Expert care for back pain, neck pain, knee pain, shoulder pain, and sports injuries
//         </p>
//         <button onClick={() => currentUser ? setView('booking') : openModal('login')} style={{
//           ...buttonStyle,
//           background: '#e67e22',
//           fontSize: '1.2em',
//           padding: '15px 40px',
//           boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
//         }}>
//           Book Appointment
//         </button>
//       </div>
//     </div>
//   );

//   const PainTypesSection = () => (
//     <div style={{ padding: '60px 20px', background: '#f8f9fa' }}>
//       <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//         <h2 style={{ textAlign: 'center', color: '#e67e22', fontSize: '2.5em', marginBottom: '50px' }}>
//           Physiotherapy Treatments For
//         </h2>
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//           gap: '30px'
//         }}>
//           {painTypes.map((pain, index) => {
//             const Icon = pain.icon;
//             return (
//               <div
//                 key={index}
//                 style={{
//                   background: 'white',
//                   padding: '40px 30px',
//                   borderRadius: '15px',
//                   textAlign: 'center',
//                   boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s',
//                   border: `3px solid ${pain.color}`
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-10px)';
//                   e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0)';
//                   e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
//                 }}
//               >
//                 <Icon size={50} style={{ color: pain.color, marginBottom: '20px' }} />
//                 <h3 style={{ color: '#333', fontSize: '1.5em', marginBottom: '15px' }}>{pain.name}</h3>
//                 <p style={{ color: '#666', fontSize: '0.95em' }}>
//                   Specialized treatment and rehabilitation
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   const BookingView = () => {
//     const date = new Date(selectedDate + 'T00:00:00');
//     const isSunday = date.getDay() === 0;
//     const slots = generateTimeSlots(selectedDate);
//     const maxDate = getMaxDate();

//     return (
//       <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '50px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em', textAlign: 'center' }}>
//             <Calendar size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />
//             Book Your Appointment
//           </h2>
          
//           <div style={{ marginBottom: '40px', textAlign: 'center' }}>
//             <label style={{ fontSize: '1.3em', marginRight: '20px', color: '#333', fontWeight: '500' }}>
//               Select Date:
//             </label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               min={new Date().toISOString().split('T')[0]}
//               max={maxDate}
//               style={{
//                 padding: '12px 25px',
//                 fontSize: '1.1em',
//                 border: '2px solid #e67e22',
//                 borderRadius: '10px',
//                 outline: 'none'
//               }}
//             />
//             <div style={{ marginTop: '15px', fontSize: '1em', color: '#666' }}>
//               {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//             </div>
//             <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#e67e22' }}>
//               Bookings available for the next 7 days
//             </div>
//           </div>

//           {isSunday ? (
//             <div style={{
//               textAlign: 'center',
//               padding: '80px',
//               background: '#ffebee',
//               borderRadius: '15px',
//               color: '#c62828',
//               fontSize: '1.5em'
//             }}>
//               Clinic is closed on Sundays
//             </div>
//           ) : (
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
//               gap: '25px'
//             }}>
//               {slots.map((slot, index) => {
//                 const booked = isSlotBooked(slot.time);
//                 const isLunch = slot.type === 'lunch';
                
//                 return (
//                   <div
//                     key={index}
//                     onClick={() => !booked && !isLunch && currentUser && openModal('booking', slot.time)}
//                     style={{
//                       padding: '30px',
//                       borderRadius: '15px',
//                       textAlign: 'center',
//                       cursor: !booked && !isLunch && currentUser ? 'pointer' : 'not-allowed',
//                       transition: 'all 0.3s',
//                       background: isLunch ? '#fff9e6' : booked ? '#ffebee' : '#e8f5e9',
//                       border: `3px solid ${isLunch ? '#ffc107' : booked ? '#dc3545' : '#28a745'}`,
//                       opacity: booked || isLunch ? 0.7 : 1
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!booked && !isLunch && currentUser) {
//                         e.currentTarget.style.transform = 'scale(1.05)';
//                         e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'scale(1)';
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   >
//                     <Clock size={28} style={{ marginBottom: '15px', color: '#e67e22' }} />
//                     <div style={{ fontSize: '1.3em', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
//                       {slot.time}
//                     </div>
//                     <div style={{ fontSize: '1em', color: '#666' }}>
//                       {isLunch ? 'Lunch Break' : booked ? 'Booked' : 'Available'}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {!currentUser && !isSunday && (
//             <div style={{
//               marginTop: '40px',
//               padding: '25px',
//               background: '#fff3cd',
//               borderRadius: '10px',
//               textAlign: 'center',
//               color: '#856404',
//               fontSize: '1.2em'
//             }}>
//               Please login or create an account to book an appointment
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const MyBookingsView = () => {
//     const myBookings = bookings.filter(b => b.userId === currentUser?.id);

//     return (
//       <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '50px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}>
//             <Users size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />
//             My Appointments
//           </h2>

//           {myBookings.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '80px', color: '#666', fontSize: '1.3em' }}>
//               No appointments yet. Book your first session!
//             </div>
//           ) : (
//             <div style={{ display: 'grid', gap: '25px' }}>
//               {myBookings.map(booking => (
//                 <div
//                   key={booking.id}
//                   style={{
//                     padding: '30px',
//                     background: '#f8f9fa',
//                     borderRadius: '15px',
//                     borderLeft: `6px solid ${
//                       booking.status === 'verified' ? '#28a745' :
//                       booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
//                     }`
//                   }}
//                 >
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                     <div><strong>Date:</strong> {booking.date}</div>
//                     <div><strong>Time:</strong> {booking.time}</div>
//                     <div><strong>Pain Type:</strong> {booking.painType || 'Not specified'}</div>
//                     <div>
//                       <strong>Status:</strong> 
//                       <span style={{ 
//                         marginLeft: '10px',
//                         padding: '5px 15px',
//                         borderRadius: '20px',
//                         fontSize: '0.9em',
//                         background: booking.status === 'verified' ? '#d4edda' : 
//                                    booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
//                         color: booking.status === 'verified' ? '#155724' : 
//                                booking.status === 'cancelled' ? '#721c24' : '#856404'
//                       }}>
//                         {booking.status.toUpperCase()}
//                       </span>
//                     </div>
//                   </div>
//                   <div style={{ marginBottom: '15px' }}>
//                     <strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22', fontWeight: 'bold' }}>{booking.verificationCode}</span>
//                   </div>
//                   {booking.reason && (
//                     <div style={{ marginBottom: '15px' }}>
//                       <strong>Reason:</strong> {booking.reason}
//                     </div>
//                   )}
//                   {booking.status !== 'cancelled' && (
//                     <button
//                       onClick={() => {
//                         if (window.confirm('Cancel this appointment?')) {
//                           BackendService.cancelBooking(booking.id, currentUser.id, false);
//                           loadBookings();
//                           setMessage({ type: 'success', text: 'Appointment cancelled successfully!' });
//                           setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                         }
//                       }}
//                       style={{...buttonStyle, background: '#dc3545'}}
//                     >
//                       <XCircle size={16} /> Cancel Appointment
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const AdminPanel = () => {
//     const [adminView, setAdminView] = useState('bookings');
//     const [cancelDate, setCancelDate] = useState('');

//     return (
//       <div style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
//         <div style={{
//           background: 'white',
//           padding: '50px',
//           borderRadius: '20px',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}>
//             <Shield size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />
//             Admin Dashboard
//           </h2>

//           <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '2px solid #e0e0e0', flexWrap: 'wrap' }}>
//             {['bookings', 'blocked'].map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setAdminView(tab)}
//                 style={{
//                   padding: '15px 35px',
//                   background: 'transparent',
//                   border: 'none',
//                   borderBottom: `4px solid ${adminView === tab ? '#e67e22' : 'transparent'}`,
//                   color: adminView === tab ? '#e67e22' : '#666',
//                   fontSize: '1.2em',
//                   cursor: 'pointer',
//                   fontWeight: adminView === tab ? 'bold' : 'normal',
//                   transition: 'all 0.3s'
//                 }}
//               >
//                 {tab === 'bookings' ? 'All Appointments' : 'Blocked Users'}
//               </button>
//             ))}
//           </div>

//           {adminView === 'bookings' && (
//             <div>
//               <div style={{ marginBottom: '30px', padding: '20px', background: '#fff3cd', borderRadius: '10px' }}>
//                 <h3 style={{ marginBottom: '15px', color: '#856404' }}>Cancel All Appointments for a Date</h3>
//                 <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//                   <input
//                     type="date"
//                     value={cancelDate}
//                     onChange={(e) => setCancelDate(e.target.value)}
//                     style={{
//                       padding: '10px 20px',
//                       border: '2px solid #e67e22',
//                       borderRadius: '8px',
//                       fontSize: '1em'
//                     }}
//                   />
//                   <button
//                     onClick={() => {
//                       if (cancelDate && window.confirm(`Cancel all appointments for ${cancelDate}?`)) {
//                         const result = BackendService.cancelAllBookings(cancelDate);
//                         loadBookings();
//                         setMessage({ type: 'success', text: `${result.count} appointments cancelled and SMS sent!` });
//                         setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                         setCancelDate('');
//                       }
//                     }}
//                     style={{...buttonStyle, background: '#dc3545'}}
//                   >
//                     Cancel All
//                   </button>
//                 </div>
//               </div>

//               {bookings.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
//                   No appointments yet
//                 </div>
//               ) : (
//                 <div style={{ display: 'grid', gap: '25px' }}>
//                   {bookings.map(booking => (
//                     <div
//                       key={booking.id}
//                       style={{
//                         padding: '30px',
//                         background: '#f8f9fa',
//                         borderRadius: '15px',
//                         borderLeft: `6px solid ${
//                           booking.status === 'verified' ? '#28a745' :
//                           booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
//                         }`
//                       }}
//                     >
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                         <div><strong>Name:</strong> {booking.name}</div>
//                         <div><strong>Phone:</strong> {booking.phone}</div>
//                         <div><strong>Email:</strong> {booking.email || 'N/A'}</div>
//                         <div><strong>Date:</strong> {booking.date}</div>
//                         <div><strong>Time:</strong> {booking.time}</div>
//                         <div><strong>Pain Type:</strong> {booking.painType || 'N/A'}</div>
//                       </div>
//                       <div style={{ marginBottom: '20px' }}>
//                         <strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22' }}>{booking.verificationCode}</span>
//                       </div>
//                       {booking.reason && (
//                         <div style={{ marginBottom: '20px' }}>
//                           <strong>Reason:</strong> {booking.reason}
//                         </div>
//                       )}
//                       <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//                         {booking.status === 'pending' && (
//                           <>
//                             <button
//                               onClick={() => {
//                                 BackendService.verifyBooking(booking.id);
//                                 loadBookings();
//                                 setMessage({ type: 'success', text: 'Appointment verified!' });
//                                 setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                               }}
//                               style={{...buttonStyle, background: '#28a745'}}
//                             >
//                               <CheckCircle size={16} /> Verify
//                             </button>
//                             <button
//                               onClick={() => {
//                                 if (window.confirm('Cancel this appointment?')) {
//                                   BackendService.cancelBooking(booking.id, null, true);
//                                   loadBookings();
//                                   setMessage({ type: 'success', text: 'Appointment cancelled and SMS sent!' });
//                                   setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                                 }
//                               }}
//                               style={{...buttonStyle, background: '#dc3545'}}
//                             >
//                               <XCircle size={16} /> Cancel
//                             </button>
//                             <button
//                               onClick={() => {
//                                 if (window.confirm(`Block user ${booking.name}?`)) {
//                                   BackendService.blockUser(booking.phone);
//                                   setMessage({ type: 'success', text: 'User blocked!' });
//                                   setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                                 }
//                               }}
//                               style={{...buttonStyle, background: '#ffc107', color: '#333'}}
//                             >
//                               <Trash2 size={16} /> Block User
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {adminView === 'blocked' && (
//             <div>
//               {BackendService.blockedUsers.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
//                   No blocked users
//                 </div>
//               ) : (
//                 <div style={{ display: 'grid', gap: '25px' }}>
//                   {BackendService.blockedUsers.map((user, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         padding: '30px',
//                         background: '#ffebee',
//                         borderRadius: '15px',
//                         borderLeft: '6px solid #dc3545'
//                       }}
//                     >
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                         <div><strong>Name:</strong> {user.name}</div>
//                         <div><strong>Phone:</strong> {user.phone}</div>
//                         <div><strong>Blocked:</strong> {new Date(user.blockedAt).toLocaleDateString()}</div>
//                       </div>
//                       <button
//                         onClick={() => {
//                           if (window.confirm(`Unblock ${user.name}?`)) {
//                             BackendService.unblockUser(user.phone);
//                             setMessage({ type: 'success', text: 'User unblocked!' });
//                             setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//                             setAdminView('bookings');
//                             setTimeout(() => setAdminView('blocked'), 10);
//                           }
//                         }}
//                         style={{...buttonStyle, background: '#28a745'}}
//                       >
//                         <CheckCircle size={16} /> Unblock
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const Modal = () => {
//     if (!showModal) return null;

//     return (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'rgba(0,0,0,0.8)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1000,
//         padding: '20px'
//       }}>
//         <div style={{
//           background: 'white',
//           padding: '50px',
//           borderRadius: '20px',
//           maxWidth: '550px',
//           width: '100%',
//           maxHeight: '90vh',
//           overflowY: 'auto'
//         }}>
//           <h2 style={{ color: '#e67e22', marginBottom: '30px', fontSize: '2em' }}>
//             {modalType === 'login' && 'Login to Your Account'}
//             {modalType === 'register' && 'Create New Account'}
//             {modalType === 'booking' && 'Confirm Your Appointment'}
//           </h2>

//           {message.text && (
//             <div style={{
//               padding: '15px',
//               borderRadius: '8px',
//               marginBottom: '25px',
//               background: message.type === 'success' ? '#d4edda' : '#f8d7da',
//               color: message.type === 'success' ? '#155724' : '#721c24'
//             }}>
//               {message.text}
//             </div>
//           )}

//           {modalType === 'login' && (
//             <form onSubmit={handleLogin}>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}>Email or Phone Number</label>
//                 <input
//                   type="text"
//                   value={formData.identifier || ''}
//                   onChange={(e) => setFormData({...formData, identifier: e.target.value})}
//                   style={inputStyle}
//                   placeholder="Enter email or phone"
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><Lock size={18} /> Password</label>
//                 <input
//                   type="password"
//                   value={formData.password || ''}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
//                 Don't have an account? 
//                 <a href="#" onClick={(e) => { e.preventDefault(); setModalType('register'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>
//                   Create New
//                 </a>
//               </div>
//               <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>
//                   Login
//                 </button>
//               </div>
//             </form>
//           )}

//           {modalType === 'register' && (
//             <form onSubmit={handleRegister}>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><User size={18} /> Full Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name || ''}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><Phone size={18} /> Phone Number *</label>
//                 <input
//                   type="tel"
//                   value={formData.phone || ''}
//                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                   style={inputStyle}
//                   placeholder="10 digit mobile number"
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><Mail size={18} /> Email (Optional)</label>
//                 <input
//                   type="email"
//                   value={formData.email || ''}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   style={inputStyle}
//                   placeholder="Optional - for email notifications"
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><Lock size={18} /> Password *</label>
//                 <input
//                   type="password"
//                   value={formData.password || ''}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}><Lock size={18} /> Confirm Password *</label>
//                 <input
//                   type="password"
//                   value={formData.confirmPassword || ''}
//                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//                   style={inputStyle}
//                   required
//                 />
//               </div>
//               <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
//                 Already have an account? 
//                 <a href="#" onClick={(e) => { e.preventDefault(); setModalType('login'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>
//                   Login
//                 </a>
//               </div>
//               <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>
//                   Create Account
//                 </button>
//               </div>
//             </form>
//           )}

//           {modalType === 'booking' && (
//             <form onSubmit={handleBooking}>
//               <div style={{
//                 padding: '25px',
//                 background: '#fff3cd',
//                 borderRadius: '10px',
//                 marginBottom: '25px',
//                 color: '#856404'
//               }}>
//                 <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Date:</strong> {selectedDate}</div>
//                 <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Time:</strong> {selectedSlot}</div>
//                 <div style={{ fontSize: '1em' }}><strong>Duration:</strong> 50 minutes session</div>
//               </div>
              
//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}>Select Pain Type *</label>
//                 <select
//                   value={formData.painType || ''}
//                   onChange={(e) => setFormData({...formData, painType: e.target.value})}
//                   style={inputStyle}
//                   required
//                 >
//                   <option value="">Choose pain type</option>
//                   {painTypes.map((pain, index) => (
//                     <option key={index} value={pain.name}>{pain.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}>Phone Number (Optional)</label>
//                 <input
//                   type="tel"
//                   value={formData.phone || ''}
//                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                   style={inputStyle}
//                   placeholder={currentUser?.phone || 'Enter phone number'}
//                 />
//               </div>

//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}>Email (Optional)</label>
//                 <input
//                   type="email"
//                   value={formData.email || ''}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   style={inputStyle}
//                   placeholder={currentUser?.email || 'Enter email'}
//                 />
//               </div>

//               <div style={formGroupStyle}>
//                 <label style={{ fontWeight: '500' }}>Describe Your Condition</label>
//                 <textarea
//                   value={formData.reason || ''}
//                   onChange={(e) => setFormData({...formData, reason: e.target.value})}
//                   style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
//                   placeholder="Please describe your pain, symptoms, or reason for consultation"
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                 <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>
//                   Cancel
//                 </button>
//                 <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>
//                   Confirm Appointment
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
//       <Header />
//       <Navigation />
      
//       {message.text && (
//         <div style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           padding: '20px 30px',
//           borderRadius: '10px',
//           background: message.type === 'success' ? '#d4edda' : '#f8d7da',
//           color: message.type === 'success' ? '#155724' : '#721c24',
//           boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
//           zIndex: 999,
//           maxWidth: '400px',
//           fontSize: '1.1em'
//         }}>
//           {message.text}
//         </div>
//       )}

//       {view === 'home' && !currentUser && (
//         <>
//           <HeroSection />
//           <PainTypesSection />
//           <BookingView />
//         </>
//       )}
//       {view === 'home' && currentUser && <BookingView />}
//       {view === 'booking' && currentUser && <BookingView />}
//       {view === 'mybookings' && currentUser && <MyBookingsView />}
//       {view === 'admin' && currentUser?.role === 'admin' && <AdminPanel />}
      
//       <Modal />

//       <div style={{
//         background: '#2c3e50',
//         color: 'white',
//         padding: '60px 20px',
//         marginTop: '80px',
//         textAlign: 'center'
//       }}>
//         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//           <h3 style={{ marginBottom: '30px', fontSize: '2em' }}>Pain Rehab Clinic</h3>
//           <div style={{ marginBottom: '20px', fontSize: '1.1em' }}>
//             <strong>Eswari</strong> - Bachelor of Physiotherapy (BPT)
//           </div>
//           <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
//             <Phone size={18} style={{ verticalAlign: 'middle' }} /> +91-8888888888 | 
//             <Mail size={18} style={{ verticalAlign: 'middle', marginLeft: '15px' }} /> websupport@justdial.com
//           </p>
//           <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
//             <strong>Working Hours:</strong> Monday - Saturday
//           </p>
//           <p style={{ marginBottom: '20px' }}>
//             Morning: 10:00 AM - 1:00 PM | Afternoon: 2:00 PM - 5:00 PM
//           </p>
//           <p style={{ marginBottom: '20px' }}>
//             Each session: 50 minutes | Bookings available for next 7 days
//           </p>
//           <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
//             <p style={{ opacity: 0.8 }}>
//               Specialized in treating Back Pain, Neck Pain, Knee Pain, Shoulder Pain, and Sports Injuries
//             </p>
//           </div>
//           <p style={{ opacity: 0.7, marginTop: '30px' }}>
//             © 2024 Pain Rehab Clinic. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const buttonStyle = {
//   padding: '12px 24px',
//   background: '#e67e22',
//   color: 'white',
//   border: 'none',
//   borderRadius: '10px',
//   cursor: 'pointer',
//   fontSize: '1em',
//   fontWeight: '500',
//   display: 'inline-flex',
//   alignItems: 'center',
//   gap: '8px',
//   transition: 'all 0.3s'
// };

// const navLinkStyle = {
//   color: '#333',
//   textDecoration: 'none',
//   fontSize: '1em',
//   fontWeight: '500',
//   transition: 'color 0.3s'
// };

// const formGroupStyle = {
//   marginBottom: '25px'
// };

// const inputStyle = {
//   width: '100%',
//   padding: '14px',
//   border: '2px solid #ddd',
//   borderRadius: '8px',
//   fontSize: '1em',
//   marginTop: '8px',
//   outline: 'none',
//   transition: 'border-color 0.3s'
// };

// export default App;



// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, User, Mail, Phone, Lock, LogOut, Trash2, Shield, CheckCircle, XCircle, Users, Activity, Heart, Zap } from 'lucide-react';

// const BackendService = {
//   users: [
//     { id: 1, phone: '1234567890', email: 'admin@eswari.com', password: 'admin123', name: 'Eswari', role: 'admin' }
//   ],
//   bookings: [],
//   blockedUsers: [],

//   register: function(userData) {
//     const existingUser = this.users.find(u => u.phone === userData.phone || (userData.email && u.email === userData.email));
//     if (existingUser) {
//       throw new Error('Phone or Email already registered');
//     }
//     const newUser = { id: Date.now(), ...userData, role: 'client', createdAt: new Date() };
//     this.users.push(newUser);
//     return { success: true, user: { ...newUser, password: undefined } };
//   },

//   login: function(identifier, password) {
//     const user = this.users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
//     if (!user) throw new Error('Invalid credentials');
//     return { success: true, user: { ...user, password: undefined } };
//   },

//   createBooking: function(bookingData) {
//     const isBlocked = this.blockedUsers.some(u => u.phone === bookingData.phone);
//     if (isBlocked) throw new Error('User is blocked from booking');
//     const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const booking = { id: Date.now(), ...bookingData, verificationCode, status: 'pending', createdAt: new Date() };
//     this.bookings.push(booking);
//     return { success: true, booking };
//   },

//   getBookings: function(userId, isAdmin) {
//     return isAdmin ? this.bookings : this.bookings.filter(b => b.userId === userId);
//   },

//   getAllBookings: function() { return this.bookings; },

//   cancelBooking: function(bookingId, userId, isAdmin) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (!booking) throw new Error('Booking not found');
//     if (!isAdmin && booking.userId !== userId) throw new Error('Unauthorized');
//     booking.status = 'cancelled';
//     return { success: true, booking };
//   },

//   cancelAllBookings: function(date) {
//     const cancelled = this.bookings.filter(b => b.date === date && b.status !== 'cancelled');
//     cancelled.forEach(b => b.status = 'cancelled');
//     return { success: true, count: cancelled.length };
//   },

//   verifyBooking: function(bookingId) {
//     const booking = this.bookings.find(b => b.id === bookingId);
//     if (booking) booking.status = 'verified';
//     return { success: true };
//   },

//   blockUser: function(phone) {
//     const user = this.users.find(u => u.phone === phone);
//     if (user && !this.blockedUsers.find(u => u.phone === phone)) {
//       this.blockedUsers.push({ phone, name: user.name, blockedAt: new Date() });
//     }
//     return { success: true };
//   },

//   unblockUser: function(phone) {
//     this.blockedUsers = this.blockedUsers.filter(u => u.phone !== phone);
//     return { success: true };
//   }
// };

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [view, setView] = useState('home');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [bookings, setBookings] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
//   const [registerForm, setRegisterForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
//   const [bookingForm, setBookingForm] = useState({ painType: '', phone: '', email: '', reason: '' });
//   const [cancelDate, setCancelDate] = useState('');

//   useEffect(() => {
//     loadAllBookings();
//     if (currentUser) loadBookings();
//   }, [currentUser]);

//   const loadBookings = () => {
//     const isAdmin = currentUser?.role === 'admin';
//     setBookings(BackendService.getBookings(currentUser?.id, isAdmin));
//   };

//   const loadAllBookings = () => setAllBookings(BackendService.getAllBookings());

//   const generateTimeSlots = () => {
//     const slots = [];
//     ['10:00 AM', '11:00 AM', '12:00 PM'].forEach(time => slots.push({ time, type: 'regular' }));
//     slots.push({ time: '01:00 PM', type: 'lunch' });
//     ['02:00 PM', '03:00 PM', '04:00 PM'].forEach(time => slots.push({ time, type: 'regular' }));
//     return slots;
//   };

//   const getMaxDate = () => {
//     const maxDate = new Date();
//     maxDate.setDate(maxDate.getDate() + 7);
//     return maxDate.toISOString().split('T')[0];
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.login(loginForm.identifier, loginForm.password);
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Login successful!' });
//       setLoginForm({ identifier: '', password: '' });
//       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleRegister = (e) => {
//     e.preventDefault();
//     if (registerForm.password !== registerForm.confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match' });
//       return;
//     }
//     try {
//       const result = BackendService.register({
//         name: registerForm.name,
//         email: registerForm.email || undefined,
//         phone: registerForm.phone,
//         password: registerForm.password
//       });
//       setCurrentUser(result.user);
//       setShowModal(false);
//       setMessage({ type: 'success', text: 'Account created successfully!' });
//       setRegisterForm({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
//       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const handleBooking = (e) => {
//     e.preventDefault();
//     try {
//       const result = BackendService.createBooking({
//         userId: currentUser.id,
//         name: currentUser.name,
//         email: bookingForm.email || currentUser.email,
//         phone: bookingForm.phone || currentUser.phone,
//         date: selectedDate,
//         time: selectedSlot,
//         reason: bookingForm.reason,
//         painType: bookingForm.painType
//       });
//       setShowModal(false);
//       setMessage({ type: 'success', text: `Booking confirmed! Your verification code: ${result.booking.verificationCode}` });
//       loadBookings();
//       loadAllBookings();
//       setBookingForm({ painType: '', phone: '', email: '', reason: '' });
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message });
//     }
//   };

//   const openModal = (type, slot = null) => {
//     setModalType(type);
//     setSelectedSlot(slot);
//     setShowModal(true);
//     setMessage({ type: '', text: '' });
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setLoginForm({ identifier: '', password: '' });
//     setRegisterForm({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
//     setBookingForm({ painType: '', phone: '', email: '', reason: '' });
//     setMessage({ type: '', text: '' });
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setView('home');
//     setBookings([]);
//   };

//   const isSlotBooked = (time) => allBookings.some(b => b.date === selectedDate && b.time === time && b.status !== 'cancelled');

//   const painTypes = [
//     { name: 'Back Pain', icon: Activity, color: '#e74c3c' },
//     { name: 'Neck Pain', icon: Heart, color: '#3498db' },
//     { name: 'Knee Pain', icon: Zap, color: '#f39c12' },
//     { name: 'Shoulder Pain', icon: Activity, color: '#9b59b6' },
//     { name: 'Sports Injury', icon: Zap, color: '#2ecc71' },
//     { name: 'Other', icon: Heart, color: '#95a5a6' }
//   ];

//   return (
//     <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
//       {/* Header */}
//       <div style={{ background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', color: 'white', padding: '20px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
//         <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
//             <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={16} /> +91-8888888888</span>
//             <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={16} /> websupport@justdial.com</span>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//             {!currentUser ? (
//               <>
//                 <button onClick={() => openModal('login')} style={{...buttonStyle, background: 'white', color: '#e67e22', padding: '8px 20px'}}>Log In</button>
//                 <button onClick={() => openModal('register')} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}>Sign Up</button>
//               </>
//             ) : (
//               <>
//                 <span style={{ fontSize: '0.95em' }}>Welcome, {currentUser.name}!</span>
//                 <button onClick={handleLogout} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}><LogOut size={16} /> Logout</button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
//         <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
//           <h2 style={{ color: '#e67e22', fontSize: '1.8em', margin: 0 }}>PAIN REHAB CLINIC</h2>
//           <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
//             <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} style={{...navLinkStyle, color: view === 'home' ? '#e67e22' : '#333'}}>HOME</a>
//             {currentUser && (
//               <>
//                 <a href="#" onClick={(e) => { e.preventDefault(); setView('booking'); }} style={{...navLinkStyle, color: view === 'booking' ? '#e67e22' : '#333'}}>BOOK APPOINTMENT</a>
//                 <a href="#" onClick={(e) => { e.preventDefault(); setView('mybookings'); }} style={{...navLinkStyle, color: view === 'mybookings' ? '#e67e22' : '#333'}}>MY BOOKINGS</a>
//                 {currentUser.role === 'admin' && <a href="#" onClick={(e) => { e.preventDefault(); setView('admin'); loadBookings(); }} style={{...navLinkStyle, color: view === 'admin' ? '#e67e22' : '#333'}}>ADMIN PANEL</a>}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       {message.text && (
//         <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '20px 30px', borderRadius: '10px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 999, maxWidth: '400px', fontSize: '1.1em' }}>
//           {message.text}
//         </div>
//       )}

//       {/* Hero Section */}
//       {view === 'home' && !currentUser && (
//         <>
//           <div style={{ background: `linear-gradient(rgba(230, 126, 34, 0.85), rgba(211, 84, 0, 0.85)), url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '120px 20px', textAlign: 'left', color: 'white' }}>
//             <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//               <h1 style={{ fontSize: '3em', marginBottom: '20px', fontWeight: '700', lineHeight: '1.2' }}>A Specialized Physiotherapy Clinic</h1>
//               <p style={{ fontSize: '1.3em', marginBottom: '40px', maxWidth: '600px' }}>Expert care for back pain, neck pain, knee pain, shoulder pain, and sports injuries</p>
//               <button onClick={() => openModal('login')} style={{ ...buttonStyle, background: '#e67e22', fontSize: '1.2em', padding: '15px 40px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)' }}>Book Appointment</button>
//             </div>
//           </div>

//           {/* Pain Types Section */}
//           <div style={{ padding: '60px 20px', background: '#f8f9fa' }}>
//             <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//               <h2 style={{ textAlign: 'center', color: '#e67e22', fontSize: '2.5em', marginBottom: '50px' }}>Physiotherapy Treatments For</h2>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
//                 {painTypes.map((pain, index) => {
//                   const Icon = pain.icon;
//                   return (
//                     <div key={index} style={{ background: 'white', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: `3px solid ${pain.color}` }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)'; }}>
//                       <Icon size={50} style={{ color: pain.color, marginBottom: '20px' }} />
//                       <h3 style={{ color: '#333', fontSize: '1.5em', marginBottom: '15px' }}>{pain.name}</h3>
//                       <p style={{ color: '#666', fontSize: '0.95em' }}>Specialized treatment and rehabilitation</p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Booking View */}
//       {(view === 'home' || view === 'booking') && (
//         <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//           <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
//             <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em', textAlign: 'center' }}><Calendar size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />Book Your Appointment</h2>
//             <div style={{ marginBottom: '40px', textAlign: 'center' }}>
//               <label style={{ fontSize: '1.3em', marginRight: '20px', color: '#333', fontWeight: '500' }}>Select Date:</label>
//               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} max={getMaxDate()} style={{ padding: '12px 25px', fontSize: '1.1em', border: '2px solid #e67e22', borderRadius: '10px', outline: 'none' }} />
//               <div style={{ marginTop: '15px', fontSize: '1em', color: '#666' }}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
//               <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#e67e22' }}>Bookings available for the next 7 days</div>
//             </div>

//             {new Date(selectedDate + 'T00:00:00').getDay() === 0 ? (
//               <div style={{ textAlign: 'center', padding: '80px', background: '#ffebee', borderRadius: '15px', color: '#c62828', fontSize: '1.5em' }}>Clinic is closed on Sundays</div>
//             ) : (
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
//                 {generateTimeSlots().map((slot, index) => {
//                   const booked = isSlotBooked(slot.time);
//                   const isLunch = slot.type === 'lunch';
//                   return (
//                     <div key={index} onClick={() => !booked && !isLunch && currentUser && openModal('booking', slot.time)} style={{ padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: !booked && !isLunch && currentUser ? 'pointer' : 'not-allowed', transition: 'all 0.3s', background: isLunch ? '#fff9e6' : booked ? '#ffebee' : '#e8f5e9', border: `3px solid ${isLunch ? '#ffc107' : booked ? '#dc3545' : '#28a745'}`, opacity: booked || isLunch ? 0.7 : 1 }} onMouseEnter={(e) => { if (!booked && !isLunch && currentUser) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; }}} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
//                       <Clock size={28} style={{ marginBottom: '15px', color: '#e67e22' }} />
//                       <div style={{ fontSize: '1.3em', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>{slot.time}</div>
//                       <div style={{ fontSize: '1em', color: '#666', fontWeight: 'bold' }}>{isLunch ? 'Lunch Break' : booked ? '🔴 BOOKED' : '✅ AVAILABLE'}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {!currentUser && new Date(selectedDate + 'T00:00:00').getDay() !== 0 && (
//               <div style={{ marginTop: '40px', padding: '25px', background: '#fff3cd', borderRadius: '10px', textAlign: 'center', color: '#856404', fontSize: '1.2em' }}>Please login or create an account to book an appointment. You can see which slots are available!</div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* My Bookings View */}
//       {view === 'mybookings' && currentUser && (
//         <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
//           <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
//             <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}><Users size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />My Appointments</h2>
//             {bookings.filter(b => b.userId === currentUser.id).length === 0 ? (
//               <div style={{ textAlign: 'center', padding: '80px', color: '#666', fontSize: '1.3em' }}>No appointments yet. Book your first session!</div>
//             ) : (
//               <div style={{ display: 'grid', gap: '25px' }}>
//                 {bookings.filter(b => b.userId === currentUser.id).map(booking => (
//                   <div key={booking.id} style={{ padding: '30px', background: '#f8f9fa', borderRadius: '15px', borderLeft: `6px solid ${booking.status === 'verified' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107'}` }}>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                       <div><strong>Date:</strong> {booking.date}</div>
//                       <div><strong>Time:</strong> {booking.time}</div>
//                       <div><strong>Pain Type:</strong> {booking.painType || 'Not specified'}</div>
//                       <div><strong>Status:</strong> <span style={{ marginLeft: '10px', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9em', background: booking.status === 'verified' ? '#d4edda' : booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd', color: booking.status === 'verified' ? '#155724' : booking.status === 'cancelled' ? '#721c24' : '#856404' }}>{booking.status.toUpperCase()}</span></div>
//                     </div>
//                     <div style={{ marginBottom: '15px' }}><strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22', fontWeight: 'bold' }}>{booking.verificationCode}</span></div>
//                     {booking.reason && <div style={{ marginBottom: '15px' }}><strong>Reason:</strong> {booking.reason}</div>}
//                     {booking.status !== 'cancelled' && (
//                       <button onClick={() => { if (window.confirm('Cancel this appointment?')) { BackendService.cancelBooking(booking.id, currentUser.id, false); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: 'Appointment cancelled successfully!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#dc3545'}}><XCircle size={16} /> Cancel Appointment</button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Admin Panel - Part 1 */}
//       {view === 'admin' && currentUser?.role === 'admin' && (
//         <div style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
//             <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}><Shield size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />Admin Dashboard</h2>
            
//             <div style={{ marginBottom: '30px', padding: '20px', background: '#fff3cd', borderRadius: '10px' }}>
//               <h3 style={{ marginBottom: '15px', color: '#856404' }}>Cancel All Appointments for a Date</h3>
//               <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
//                 <input type="date" value={cancelDate} onChange={(e) => setCancelDate(e.target.value)} style={{ padding: '10px 20px', border: '2px solid #e67e22', borderRadius: '8px', fontSize: '1em' }} />
//                 <button onClick={() => { if (cancelDate && window.confirm(`Cancel all appointments for ${cancelDate}?`)) { const result = BackendService.cancelAllBookings(cancelDate); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: `${result.count} appointments cancelled and SMS sent!` }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); setCancelDate(''); }}} style={{...buttonStyle, background: '#dc3545'}}>Cancel All</button>
//               </div>
//             </div>

//             {bookings.length === 0 ? (
//               <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>No appointments yet</div>
//             ) : (
//               <div style={{ display: 'grid', gap: '25px' }}>
//                 {bookings.map(booking => (
//                   <div key={booking.id} style={{ padding: '30px', background: '#f8f9fa', borderRadius: '15px', borderLeft: `6px solid ${booking.status === 'verified' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107'}` }}>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                       <div><strong>Name:</strong> {booking.name}</div>
//                       <div><strong>Phone:</strong> {booking.phone}</div>
//                       <div><strong>Email:</strong> {booking.email || 'N/A'}</div>
//                       <div><strong>Date:</strong> {booking.date}</div>
//                       <div><strong>Time:</strong> {booking.time}</div>
//                       <div><strong>Pain Type:</strong> {booking.painType || 'N/A'}</div>
//                     </div>
//                     <div style={{ marginBottom: '20px' }}><strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22' }}>{booking.verificationCode}</span></div>
//                     {booking.reason && <div style={{ marginBottom: '20px' }}><strong>Reason:</strong> {booking.reason}</div>}
//                     <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//                       {booking.status === 'pending' && (
//                         <>
//                           <button onClick={() => { BackendService.verifyBooking(booking.id); loadBookings(); setMessage({ type: 'success', text: 'Appointment verified!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }} style={{...buttonStyle, background: '#28a745'}}><CheckCircle size={16} /> Verify</button>
//                           <button onClick={() => { if (window.confirm('Cancel this appointment?')) { BackendService.cancelBooking(booking.id, null, true); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: 'Appointment cancelled and SMS sent!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#dc3545'}}><XCircle size={16} /> Cancel</button>
//                           <button onClick={() => { if (window.confirm(`Block user ${booking.name}?`)) { BackendService.blockUser(booking.phone); setMessage({ type: 'success', text: 'User blocked!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#ffc107', color: '#333'}}><Trash2 size={16} /> Block User</button>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
//           <div style={{ background: 'white', padding: '50px', borderRadius: '20px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
//             <h2 style={{ color: '#e67e22', marginBottom: '30px', fontSize: '2em' }}>
//               {modalType === 'login' && 'Login to Your Account'}
//               {modalType === 'register' && 'Create New Account'}
//               {modalType === 'booking' && 'Confirm Your Appointment'}
//             </h2>

//             {message.text && <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '25px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>{message.text}</div>}

//             {modalType === 'login' && (
//               <form onSubmit={handleLogin}>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}>Email or Phone Number</label>
//                   <input type="text" value={loginForm.identifier} onChange={(e) => setLoginForm({...loginForm, identifier: e.target.value})} style={inputStyle} placeholder="Enter email or phone" required />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><Lock size={18} /> Password</label>
//                   <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} required />
//                 </div>
//                 <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
//                   Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setModalType('register'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>Create New</a>
//                 </div>
//                 <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                   <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
//                   <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Login</button>
//                 </div>
//               </form>
//             )}

//             {modalType === 'register' && (
//               <form onSubmit={handleRegister}>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><User size={18} /> Full Name *</label>
//                   <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} style={inputStyle} required />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><Phone size={18} /> Phone Number *</label>
//                   <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} style={inputStyle} placeholder="10 digit mobile number" required />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><Mail size={18} /> Email (Optional)</label>
//                   <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} style={inputStyle} placeholder="Optional - for email notifications" />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><Lock size={18} /> Password *</label>
//                   <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} style={inputStyle} required />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}><Lock size={18} /> Confirm Password *</label>
//                   <input type="password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})} style={inputStyle} required />
//                 </div>
//                 <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
//                   Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setModalType('login'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>Login</a>
//                 </div>
//                 <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                   <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
//                   <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Create Account</button>
//                 </div>
//               </form>
//             )}

//             {modalType === 'booking' && (
//               <form onSubmit={handleBooking}>
//                 <div style={{ padding: '25px', background: '#fff3cd', borderRadius: '10px', marginBottom: '25px', color: '#856404' }}>
//                   <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Date:</strong> {selectedDate}</div>
//                   <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Time:</strong> {selectedSlot}</div>
//                   <div style={{ fontSize: '1em' }}><strong>Duration:</strong> 50 minutes session</div>
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}>Select Pain Type *</label>
//                   <select value={bookingForm.painType} onChange={(e) => setBookingForm({...bookingForm, painType: e.target.value})} style={inputStyle} required>
//                     <option value="">Choose pain type</option>
//                     {painTypes.map((pain, index) => <option key={index} value={pain.name}>{pain.name}</option>)}
//                   </select>
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}>Phone Number (Optional)</label>
//                   <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} style={inputStyle} placeholder={currentUser?.phone || 'Enter phone number'} />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}>Email (Optional)</label>
//                   <input type="email" value={bookingForm.email} onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} style={inputStyle} placeholder={currentUser?.email || 'Enter email'} />
//                 </div>
//                 <div style={formGroupStyle}>
//                   <label style={{ fontWeight: '500' }}>Describe Your Condition</label>
//                   <textarea value={bookingForm.reason} onChange={(e) => setBookingForm({...bookingForm, reason: e.target.value})} style={{...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit'}} placeholder="Please describe your pain, symptoms, or reason for consultation" />
//                 </div>
//                 <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
//                   <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
//                   <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Confirm Appointment</button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div style={{ background: '#2c3e50', color: 'white', padding: '60px 20px', marginTop: '80px', textAlign: 'center' }}>
//         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//           <h3 style={{ marginBottom: '30px', fontSize: '2em' }}>Pain Rehab Clinic</h3>
//           <div style={{ marginBottom: '20px', fontSize: '1.1em' }}><strong>Eswari</strong> - Bachelor of Physiotherapy (BPT)</div>
//           <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
//             <Phone size={18} style={{ verticalAlign: 'middle' }} /> +91-8888888888 | <Mail size={18} style={{ verticalAlign: 'middle', marginLeft: '15px' }} /> websupport@justdial.com
//           </p>
//           <p style={{ marginBottom: '20px', fontSize: '1.1em' }}><strong>Working Hours:</strong> Monday - Saturday</p>
//           <p style={{ marginBottom: '20px' }}>Morning: 10:00 AM - 1:00 PM | Afternoon: 2:00 PM - 5:00 PM</p>
//           <p style={{ marginBottom: '20px' }}>Each session: 50 minutes | Bookings available for next 7 days</p>
//           <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
//             <p style={{ opacity: 0.8 }}>Specialized in treating Back Pain, Neck Pain, Knee Pain, Shoulder Pain, and Sports Injuries</p>
//           </div>
//           <p style={{ opacity: 0.7, marginTop: '30px' }}>© 2024 Pain Rehab Clinic. All rights reserved.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const buttonStyle = {
//   padding: '12px 24px',
//   background: '#e67e22',
//   color: 'white',
//   border: 'none',
//   borderRadius: '10px',
//   cursor: 'pointer',
//   fontSize: '1em',
//   fontWeight: '500',
//   display: 'inline-flex',
//   alignItems: 'center',
//   gap: '8px',
//   transition: 'all 0.3s'
// };

// const navLinkStyle = {
//   color: '#333',
//   textDecoration: 'none',
//   fontSize: '1em',
//   fontWeight: '500',
//   transition: 'color 0.3s'
// };

// const formGroupStyle = {
//   marginBottom: '25px'
// };

// const inputStyle = {
//   width: '100%',
//   padding: '14px',
//   border: '2px solid #ddd',
//   borderRadius: '8px',
//   fontSize: '1em',
//   marginTop: '8px',
//   outline: 'none',
//   transition: 'border-color 0.3s'
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Lock, LogOut, Trash2, Shield, CheckCircle, XCircle, Users, Activity, Heart, Zap, Key } from 'lucide-react';
const BackendService = {
  users: [
    { id: 1, phone: '9524350214', email: 'adminsiva@eswari.com', password: 'eshu@10th469', name: 'Eswari', role: 'admin', phoneVerified: true }
  ],
  bookings: [],
  blockedUsers: [],
  otpStore: new Map(),
  otpAttempts: new Map(),

  validateIndianMobile: function(phone) {
    const cleanNumber = phone.replace(/^\+91/, '').replace(/\s+/g, '');
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanNumber)) {
      throw new Error('Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9');
    }
    return cleanNumber;
  },

  sendOTP: function(phone, purpose = 'registration') {
    const cleanPhone = this.validateIndianMobile(phone);
    const today = new Date().toDateString();
    
    if (!this.otpAttempts.has(cleanPhone)) {
      this.otpAttempts.set(cleanPhone, { count: 0, date: today });
    }
    
    const attempts = this.otpAttempts.get(cleanPhone);
    if (attempts.date !== today) {
      attempts.count = 0;
      attempts.date = today;
    }
    
    if (attempts.count >= 5) {
      throw new Error('Daily OTP limit reached (5 OTPs). Try again tomorrow.');
    }
    
    if (purpose === 'registration') {
      const existingUser = this.users.find(u => u.phone === cleanPhone);
      if (existingUser) throw new Error('Phone number already registered');
    }
    
    if (purpose === 'password-reset') {
      const user = this.users.find(u => u.phone === cleanPhone);
      if (!user) throw new Error('Phone number not registered');
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (5 * 60 * 1000);
    
    this.otpStore.set(cleanPhone, { otp, expiresAt, purpose, attempts: 0 });
    attempts.count++;
    
    console.log(`🔐 OTP for ${cleanPhone}: ${otp} (Valid for 5 minutes)`);
    alert(`OTP sent to +91${cleanPhone}: ${otp}\n(Check console in production)`);
    
    return { success: true, message: 'OTP sent successfully', expiresIn: 300, attemptsRemaining: 5 - attempts.count };
  },

  verifyOTP: function(phone, otp) {
    const cleanPhone = this.validateIndianMobile(phone);
    const otpData = this.otpStore.get(cleanPhone);
    
    if (!otpData) throw new Error('OTP not found or expired. Please request a new OTP.');
    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(cleanPhone);
      throw new Error('OTP has expired. Please request a new OTP.');
    }
    if (otpData.attempts >= 3) {
      this.otpStore.delete(cleanPhone);
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }
    if (otpData.otp !== otp) {
      otpData.attempts++;
      throw new Error(`Invalid OTP. ${3 - otpData.attempts} attempts remaining.`);
    }
    
    this.otpStore.delete(cleanPhone);
    return { success: true, purpose: otpData.purpose };
  },

  register: function(userData, otp) {
    const cleanPhone = this.validateIndianMobile(userData.phone);
    
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    this.verifyOTP(userData.phone, otp);
    
    const existingUser = this.users.find(u => u.phone === cleanPhone || (userData.email && u.email === userData.email));
    if (existingUser) throw new Error('Phone or Email already registered');
    
    const newUser = { id: Date.now(), ...userData, phone: cleanPhone, role: 'client', phoneVerified: true, createdAt: new Date() };
    this.users.push(newUser);
    return { success: true, user: { ...newUser, password: undefined } };
  },

  login: function(identifier, password) {
    const cleanIdentifier = identifier.replace(/^\+91/, '');
    const user = this.users.find(u => (u.email === cleanIdentifier || u.phone === cleanIdentifier) && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    if (user.isBlocked) throw new Error('User is blocked. Contact admin: +919524350214');
    return { success: true, user: { ...user, password: undefined } };
  },

  resetPassword: function(phone, otp, newPassword) {
    const cleanPhone = this.validateIndianMobile(phone);
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const otpResult = this.verifyOTP(phone, otp);
    if (otpResult.purpose !== 'password-reset') throw new Error('Invalid OTP for password reset');
    
    const user = this.users.find(u => u.phone === cleanPhone);
    if (!user) throw new Error('User not found');
    
    user.password = newPassword;
    return { success: true, message: 'Password reset successfully' };
  },

  createBooking: function(bookingData) {
    const isBlocked = this.blockedUsers.some(u => u.phone === bookingData.phone);
    if (isBlocked) throw new Error('User is blocked from booking');
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const booking = { id: Date.now(), ...bookingData, verificationCode, status: 'pending', createdAt: new Date() };
    this.bookings.push(booking);
    return { success: true, booking };
  },

  getBookings: function(userId, isAdmin) {
    return isAdmin ? this.bookings : this.bookings.filter(b => b.userId === userId);
  },

  getAllBookings: function() { return this.bookings; },

  cancelBooking: function(bookingId, userId, isAdmin) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (!isAdmin && booking.userId !== userId) throw new Error('Unauthorized');
    booking.status = 'cancelled';
    return { success: true, booking };
  },

  cancelAllBookings: function(date) {
    const cancelled = this.bookings.filter(b => b.date === date && b.status !== 'cancelled');
    cancelled.forEach(b => b.status = 'cancelled');
    return { success: true, count: cancelled.length };
  },

  verifyBooking: function(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) booking.status = 'verified';
    return { success: true };
  },

  blockUser: function(phone) {
    const user = this.users.find(u => u.phone === phone);
    if (user && !this.blockedUsers.find(u => u.phone === phone)) {
      this.blockedUsers.push({ phone, name: user.name, blockedAt: new Date() });
    }
    return { success: true };
  },

  unblockUser: function(phone) {
    this.blockedUsers = this.blockedUsers.filter(u => u.phone !== phone);
    return { success: true };
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
  const [resetForm, setResetForm] = useState({ phone: '', otp: '', newPassword: '', confirmPassword: '' });
  const [bookingForm, setBookingForm] = useState({ painType: '', phone: '', email: '', reason: '' });
  const [cancelDate, setCancelDate] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    loadAllBookings();
    if (currentUser) loadBookings();
  }, [currentUser]);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && otpSent) {
      setOtpSent(false);
    }
  }, [otpTimer, otpSent]);

  const loadBookings = () => {
    const isAdmin = currentUser?.role === 'admin';
    setBookings(BackendService.getBookings(currentUser?.id, isAdmin));
  };

  const loadAllBookings = () => setAllBookings(BackendService.getAllBookings());

  const generateTimeSlots = () => {
    const slots = [];
    ['10:00 AM', '11:00 AM', '12:00 PM'].forEach(time => slots.push({ time, type: 'regular' }));
    slots.push({ time: '01:00 PM', type: 'lunch' });
    ['02:00 PM', '03:00 PM', '04:00 PM'].forEach(time => slots.push({ time, type: 'regular' }));
    return slots;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSendOTP = (phone, purpose) => {
    try {
      const result = BackendService.sendOTP(phone, purpose);
      setOtpSent(true);
      setOtpTimer(300);
      setMessage({ type: 'success', text: `OTP sent to +91${phone.replace(/^\+91/, '')}. Valid for 5 minutes. (${result.attemptsRemaining} OTPs remaining today)` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      const result = BackendService.login(loginForm.identifier, loginForm.password);
      setCurrentUser(result.user);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Login successful!' });
      setLoginForm({ identifier: '', password: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (!otpSent || !registerForm.otp) {
      setMessage({ type: 'error', text: 'Please verify your phone with OTP' });
      return;
    }
    try {
      const result = BackendService.register({
        name: registerForm.name,
        email: registerForm.email || undefined,
        phone: registerForm.phone,
        password: registerForm.password
      }, registerForm.otp);
      setCurrentUser(result.user);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Account created successfully!' });
      setRegisterForm({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
      setOtpSent(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (resetForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (!otpSent || !resetForm.otp) {
      setMessage({ type: 'error', text: 'Please verify your phone with OTP' });
      return;
    }
    try {
      BackendService.resetPassword(resetForm.phone, resetForm.otp, resetForm.newPassword);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Password reset successfully! Please login with your new password.' });
      setResetForm({ phone: '', otp: '', newPassword: '', confirmPassword: '' });
      setOtpSent(false);
      setTimeout(() => { setModalType('login'); setMessage({ type: '', text: '' }); }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleBooking = (e) => {
    e.preventDefault();
    try {
      const result = BackendService.createBooking({
        userId: currentUser.id,
        name: currentUser.name,
        email: bookingForm.email || currentUser.email,
        phone: bookingForm.phone || currentUser.phone,
        date: selectedDate,
        time: selectedSlot,
        reason: bookingForm.reason,
        painType: bookingForm.painType
      });
      setShowModal(false);
      setMessage({ type: 'success', text: `Booking confirmed! Your verification code: ${result.booking.verificationCode}` });
      loadBookings();
      loadAllBookings();
      setBookingForm({ painType: '', phone: '', email: '', reason: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const openModal = (type, slot = null) => {
    setModalType(type);
    setSelectedSlot(slot);
    setShowModal(true);
    setMessage({ type: '', text: '' });
    setOtpSent(false);
    setOtpTimer(0);
  };

  const closeModal = () => {
    setShowModal(false);
    setLoginForm({ identifier: '', password: '' });
    setRegisterForm({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
    setResetForm({ phone: '', otp: '', newPassword: '', confirmPassword: '' });
    setBookingForm({ painType: '', phone: '', email: '', reason: '' });
    setMessage({ type: '', text: '' });
    setOtpSent(false);
    setOtpTimer(0);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setBookings([]);
  };

  const isSlotBooked = (time) => allBookings.some(b => b.date === selectedDate && b.time === time && b.status !== 'cancelled');

  const painTypes = [
    { name: 'Back Pain', icon: Activity, color: '#e74c3c' },
    { name: 'Neck Pain', icon: Heart, color: '#3498db' },
    { name: 'Knee Pain', icon: Zap, color: '#f39c12' },
    { name: 'Shoulder Pain', icon: Activity, color: '#9b59b6' },
    { name: 'Sports Injury', icon: Zap, color: '#2ecc71' },
    { name: 'Other', icon: Heart, color: '#95a5a6' }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', color: 'white', padding: '20px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={16} /> +91-8888888888</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={16} /> websupport@justdial.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!currentUser ? (
              <>
                <button onClick={() => openModal('login')} style={{...buttonStyle, background: 'white', color: '#e67e22', padding: '8px 20px'}}>Log In</button>
                <button onClick={() => openModal('register')} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}>Sign Up</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.95em' }}>Welcome, {currentUser.name}!</span>
                <button onClick={handleLogout} style={{...buttonStyle, background: 'transparent', border: '2px solid white', padding: '8px 20px'}}><LogOut size={16} /> Logout</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h2 style={{ color: '#e67e22', fontSize: '1.8em', margin: 0 }}>PAIN REHAB CLINIC</h2>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} style={{...navLinkStyle, color: view === 'home' ? '#e67e22' : '#333'}}>HOME</a>
            {currentUser && (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('booking'); }} style={{...navLinkStyle, color: view === 'booking' ? '#e67e22' : '#333'}}>BOOK APPOINTMENT</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('mybookings'); }} style={{...navLinkStyle, color: view === 'mybookings' ? '#e67e22' : '#333'}}>MY BOOKINGS</a>
                {currentUser.role === 'admin' && <a href="#" onClick={(e) => { e.preventDefault(); setView('admin'); loadBookings(); }} style={{...navLinkStyle, color: view === 'admin' ? '#e67e22' : '#333'}}>ADMIN PANEL</a>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '20px 30px', borderRadius: '10px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 999, maxWidth: '400px', fontSize: '1.1em' }}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      {view === 'home' && !currentUser && (
        <>
          <div style={{ background: `linear-gradient(rgba(230, 126, 34, 0.85), rgba(211, 84, 0, 0.85)), url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '120px 20px', textAlign: 'left', color: 'white' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '3em', marginBottom: '20px', fontWeight: '700', lineHeight: '1.2' }}>A Specialized Physiotherapy Clinic</h1>
              <p style={{ fontSize: '1.3em', marginBottom: '40px', maxWidth: '600px' }}>Expert care for back pain, neck pain, knee pain, shoulder pain, and sports injuries</p>
              <button onClick={() => openModal('register')} style={{ ...buttonStyle, background: '#e67e22', fontSize: '1.2em', padding: '15px 40px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)' }}>Book Appointment</button>
            </div>
          </div>

          {/* Pain Types Section */}
          <div style={{ padding: '60px 20px', background: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', color: '#e67e22', fontSize: '2.5em', marginBottom: '50px' }}>Physiotherapy Treatments For</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                {painTypes.map((pain, index) => {
                  const Icon = pain.icon;
                  return (
                    <div key={index} style={{ background: 'white', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: `3px solid ${pain.color}` }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)'; }}>
                      <Icon size={50} style={{ color: pain.color, marginBottom: '20px' }} />
                      <h3 style={{ color: '#333', fontSize: '1.5em', marginBottom: '15px' }}>{pain.name}</h3>
                      <p style={{ color: '#666', fontSize: '0.95em' }}>Specialized treatment and rehabilitation</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Booking View */}
      {(view === 'home' || view === 'booking') && (
        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em', textAlign: 'center' }}><Calendar size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />Book Your Appointment</h2>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <label style={{ fontSize: '1.3em', marginRight: '20px', color: '#333', fontWeight: '500' }}>Select Date:</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} max={getMaxDate()} style={{ padding: '12px 25px', fontSize: '1.1em', border: '2px solid #e67e22', borderRadius: '10px', outline: 'none' }} />
              <div style={{ marginTop: '15px', fontSize: '1em', color: '#666' }}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#e67e22' }}>Bookings available for the next 7 days</div>
            </div>

            {new Date(selectedDate + 'T00:00:00').getDay() === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: '#ffebee', borderRadius: '15px', color: '#c62828', fontSize: '1.5em' }}>Clinic is closed on Sundays</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                {generateTimeSlots().map((slot, index) => {
                  const booked = isSlotBooked(slot.time);
                  const isLunch = slot.type === 'lunch';
                  return (
                    <div key={index} onClick={() => !booked && !isLunch && currentUser && openModal('booking', slot.time)} style={{ padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: !booked && !isLunch && currentUser ? 'pointer' : 'not-allowed', transition: 'all 0.3s', background: isLunch ? '#fff9e6' : booked ? '#ffebee' : '#e8f5e9', border: `3px solid ${isLunch ? '#ffc107' : booked ? '#dc3545' : '#28a745'}`, opacity: booked || isLunch ? 0.7 : 1 }} onMouseEnter={(e) => { if (!booked && !isLunch && currentUser) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; }}} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <Clock size={28} style={{ marginBottom: '15px', color: '#e67e22' }} />
                      <div style={{ fontSize: '1.3em', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>{slot.time}</div>
                      <div style={{ fontSize: '1em', color: '#666', fontWeight: 'bold' }}>{isLunch ? 'Lunch Break' : booked ? '🔴 BOOKED' : '✅ AVAILABLE'}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {!currentUser && new Date(selectedDate + 'T00:00:00').getDay() !== 0 && (
              <div style={{ marginTop: '40px', padding: '25px', background: '#fff3cd', borderRadius: '10px', textAlign: 'center', color: '#856404', fontSize: '1.2em' }}>
                <div style={{ marginBottom: '15px' }}>📱 Indian mobile numbers only • OTP verification required • Min 8 char password</div>
                Please login or create an account to book an appointment. You can see which slots are available!
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Bookings View */}
      {view === 'mybookings' && currentUser && (
        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}><Users size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />My Appointments</h2>
            {bookings.filter(b => b.userId === currentUser.id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#666', fontSize: '1.3em' }}>No appointments yet. Book your first session!</div>
            ) : (
              <div style={{ display: 'grid', gap: '25px' }}>
                {bookings.filter(b => b.userId === currentUser.id).map(booking => (
                  <div key={booking.id} style={{ padding: '30px', background: '#f8f9fa', borderRadius: '15px', borderLeft: `6px solid ${booking.status === 'verified' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107'}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div><strong>Date:</strong> {booking.date}</div>
                      <div><strong>Time:</strong> {booking.time}</div>
                      <div><strong>Pain Type:</strong> {booking.painType || 'Not specified'}</div>
                      <div><strong>Status:</strong> <span style={{ marginLeft: '10px', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9em', background: booking.status === 'verified' ? '#d4edda' : booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd', color: booking.status === 'verified' ? '#155724' : booking.status === 'cancelled' ? '#721c24' : '#856404' }}>{booking.status.toUpperCase()}</span></div>
                    </div>
                    <div style={{ marginBottom: '15px' }}><strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22', fontWeight: 'bold' }}>{booking.verificationCode}</span></div>
                    {booking.reason && <div style={{ marginBottom: '15px' }}><strong>Reason:</strong> {booking.reason}</div>}
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => { if (window.confirm('Cancel this appointment?')) { BackendService.cancelBooking(booking.id, currentUser.id, false); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: 'Appointment cancelled successfully!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#dc3545'}}><XCircle size={16} /> Cancel Appointment</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {view === 'admin' && currentUser?.role === 'admin' && (
        <div style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#e67e22', marginBottom: '40px', fontSize: '2.5em' }}><Shield size={40} style={{ verticalAlign: 'middle', marginRight: '15px' }} />Admin Dashboard</h2>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#fff3cd', borderRadius: '10px' }}>
              <h3 style={{ marginBottom: '15px', color: '#856404' }}>Cancel All Appointments for a Date</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="date" value={cancelDate} onChange={(e) => setCancelDate(e.target.value)} style={{ padding: '10px 20px', border: '2px solid #e67e22', borderRadius: '8px', fontSize: '1em' }} />
                <button onClick={() => { if (cancelDate && window.confirm(`Cancel all appointments for ${cancelDate}? SMS will be sent to all patients.`)) { const result = BackendService.cancelAllBookings(cancelDate); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: `${result.count} appointments cancelled and SMS sent to all patients!` }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); setCancelDate(''); }}} style={{...buttonStyle, background: '#dc3545'}}>Cancel All & Send SMS</button>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>No appointments yet</div>
            ) : (
              <div style={{ display: 'grid', gap: '25px' }}>
                {bookings.map(booking => (
                  <div key={booking.id} style={{ padding: '30px', background: '#f8f9fa', borderRadius: '15px', borderLeft: `6px solid ${booking.status === 'verified' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107'}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div><strong>Name:</strong> {booking.name}</div>
                      <div><strong>Phone:</strong> +91{booking.phone}</div>
                      <div><strong>Email:</strong> {booking.email || 'N/A'}</div>
                      <div><strong>Date:</strong> {booking.date}</div>
                      <div><strong>Time:</strong> {booking.time}</div>
                      <div><strong>Pain Type:</strong> {booking.painType || 'N/A'}</div>
                    </div>
                    <div style={{ marginBottom: '20px' }}><strong>Verification Code:</strong> <span style={{ fontSize: '1.2em', color: '#e67e22' }}>{booking.verificationCode}</span></div>
                    {booking.reason && <div style={{ marginBottom: '20px' }}><strong>Reason:</strong> {booking.reason}</div>}
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => { BackendService.verifyBooking(booking.id); loadBookings(); setMessage({ type: 'success', text: 'Appointment verified! SMS sent to patient.' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }} style={{...buttonStyle, background: '#28a745'}}><CheckCircle size={16} /> Verify & Send SMS</button>
                          <button onClick={() => { if (window.confirm('Cancel this appointment? SMS will be sent.')) { BackendService.cancelBooking(booking.id, null, true); loadBookings(); loadAllBookings(); setMessage({ type: 'success', text: 'Appointment cancelled and SMS sent to patient!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#dc3545'}}><XCircle size={16} /> Cancel & Send SMS</button>
                          <button onClick={() => { if (window.confirm(`Block user ${booking.name}? They won't be able to book anymore.`)) { BackendService.blockUser(booking.phone); setMessage({ type: 'success', text: 'User blocked!' }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }}} style={{...buttonStyle, background: '#ffc107', color: '#333'}}><Trash2 size={16} /> Block User</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '50px', borderRadius: '20px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#e67e22', marginBottom: '30px', fontSize: '2em' }}>
              {modalType === 'login' && 'Login to Your Account'}
              {modalType === 'register' && '📱 Create New Account (Indian Mobile Only)'}
              {modalType === 'reset' && '🔑 Reset Password'}
              {modalType === 'booking' && 'Confirm Your Appointment'}
            </h2>

            {message.text && <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '25px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>{message.text}</div>}

            {modalType === 'login' && (
              <form onSubmit={handleLogin}>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}>Email or Phone Number</label>
                  <input type="text" value={loginForm.identifier} onChange={(e) => setLoginForm({...loginForm, identifier: e.target.value})} style={inputStyle} placeholder="Enter email or 10-digit phone" required />
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Lock size={18} /> Password</label>
                  <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} required />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setModalType('reset'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', fontWeight: 'bold' }}>Forgot Password?</a>
                  <div style={{ marginTop: '10px' }}>
                    Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setModalType('register'); setMessage({ type: '', text: '' }); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>Create New</a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
                  <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Login</button>
                </div>
              </form>
            )}

            {modalType === 'register' && (
              <form onSubmit={handleRegister}>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><User size={18} /> Full Name *</label>
                  <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} style={inputStyle} required />
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Phone size={18} /> Indian Mobile Number *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value.replace(/\D/g, '')})} style={{...inputStyle, flex: 1}} placeholder="10 digits (6-9 starting)" maxLength="10" required />
                    <button type="button" onClick={() => handleSendOTP(registerForm.phone, 'registration')} disabled={otpSent && otpTimer > 0} style={{...buttonStyle, background: otpSent && otpTimer > 0 ? '#95a5a6' : '#3498db', whiteSpace: 'nowrap'}}>
                      {otpSent && otpTimer > 0 ? formatTime(otpTimer) : 'Send OTP'}
                    </button>
                  </div>
                </div>
                {otpSent && (
                  <div style={formGroupStyle}>
                    <label style={{ fontWeight: '500' }}><Key size={18} /> Enter OTP *</label>
                    <input type="text" value={registerForm.otp} onChange={(e) => setRegisterForm({...registerForm, otp: e.target.value.replace(/\D/g, '')})} style={inputStyle} placeholder="6-digit OTP" maxLength="6" required />
                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>Valid for 5 minutes • Max 3 attempts • 5 OTPs per day</div>
                  </div>
                )}
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Mail size={18} /> Email (Optional)</label>
                  <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} style={inputStyle} placeholder="Optional - for email notifications" />
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Lock size={18} /> Password *</label>
                  <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} style={inputStyle} minLength="8" required />
                  <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>Minimum 8 characters required</div>
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Lock size={18} /> Confirm Password *</label>
                  <input type="password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})} style={inputStyle} minLength="8" required />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                  Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setModalType('login'); setMessage({ type: '', text: '' }); setOtpSent(false); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>Login</a>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
                  <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Create Account</button>
                </div>
              </form>
            )}

            {modalType === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}><Phone size={18} /> Registered Mobile Number *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="tel" value={resetForm.phone} onChange={(e) => setResetForm({...resetForm, phone: e.target.value.replace(/\D/g, '')})} style={{...inputStyle, flex: 1}} placeholder="10 digits" maxLength="10" required />
                    <button type="button" onClick={() => handleSendOTP(resetForm.phone, 'password-reset')} disabled={otpSent && otpTimer > 0} style={{...buttonStyle, background: otpSent && otpTimer > 0 ? '#95a5a6' : '#3498db', whiteSpace: 'nowrap'}}>
                      {otpSent && otpTimer > 0 ? formatTime(otpTimer) : 'Send OTP'}
                    </button>
                  </div>
                </div>
                {otpSent && (
                  <>
                    <div style={formGroupStyle}>
                      <label style={{ fontWeight: '500' }}><Key size={18} /> Enter OTP *</label>
                      <input type="text" value={resetForm.otp} onChange={(e) => setResetForm({...resetForm, otp: e.target.value.replace(/\D/g, '')})} style={inputStyle} placeholder="6-digit OTP" maxLength="6" required />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={{ fontWeight: '500' }}><Lock size={18} /> New Password *</label>
                      <input type="password" value={resetForm.newPassword} onChange={(e) => setResetForm({...resetForm, newPassword: e.target.value})} style={inputStyle} minLength="8" required />
                      <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>Minimum 8 characters required</div>
                    </div>
                    <div style={formGroupStyle}>
                      <label style={{ fontWeight: '500' }}><Lock size={18} /> Confirm New Password *</label>
                      <input type="password" value={resetForm.confirmPassword} onChange={(e) => setResetForm({...resetForm, confirmPassword: e.target.value})} style={inputStyle} minLength="8" required />
                    </div>
                  </>
                )}
                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                  Remember password? <a href="#" onClick={(e) => { e.preventDefault(); setModalType('login'); setMessage({ type: '', text: '' }); setOtpSent(false); }} style={{ color: '#e67e22', marginLeft: '5px', fontWeight: 'bold' }}>Login</a>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
                  <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Reset Password</button>
                </div>
              </form>
            )}

            {modalType === 'booking' && (
              <form onSubmit={handleBooking}>
                <div style={{ padding: '25px', background: '#fff3cd', borderRadius: '10px', marginBottom: '25px', color: '#856404' }}>
                  <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Date:</strong> {selectedDate}</div>
                  <div style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Time:</strong> {selectedSlot}</div>
                  <div style={{ fontSize: '1em' }}><strong>Duration:</strong> 50 minutes session</div>
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}>Select Pain Type *</label>
                  <select value={bookingForm.painType} onChange={(e) => setBookingForm({...bookingForm, painType: e.target.value})} style={inputStyle} required>
                    <option value="">Choose pain type</option>
                    {painTypes.map((pain, index) => <option key={index} value={pain.name}>{pain.name}</option>)}
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}>Phone Number (Optional)</label>
                  <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} style={inputStyle} placeholder={currentUser?.phone || 'Enter phone number'} />
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}>Email (Optional)</label>
                  <input type="email" value={bookingForm.email} onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} style={inputStyle} placeholder={currentUser?.email || 'Enter email'} />
                </div>
                <div style={formGroupStyle}>
                  <label style={{ fontWeight: '500' }}>Describe Your Condition</label>
                  <textarea value={bookingForm.reason} onChange={(e) => setBookingForm({...bookingForm, reason: e.target.value})} style={{...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit'}} placeholder="Please describe your pain, symptoms, or reason for consultation" />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button type="button" onClick={closeModal} style={{...buttonStyle, background: '#6c757d', flex: 1}}>Cancel</button>
                  <button type="submit" style={{...buttonStyle, background: '#e67e22', flex: 1}}>Confirm Appointment</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: '#2c3e50', color: 'white', padding: '60px 20px', marginTop: '80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '30px', fontSize: '2em' }}>Pain Rehab Clinic</h3>
          <div style={{ marginBottom: '20px', fontSize: '1.1em' }}><strong>Eswari</strong> - Bachelor of Physiotherapy (BPT)</div>
          <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
            <Phone size={18} style={{ verticalAlign: 'middle' }} /> +91-8888888888 | <Mail size={18} style={{ verticalAlign: 'middle', marginLeft: '15px' }} /> websupport@justdial.com
          </p>
          <p style={{ marginBottom: '20px', fontSize: '1.1em' }}><strong>Working Hours:</strong> Monday - Saturday</p>
          <p style={{ marginBottom: '20px' }}>Morning: 10:00 AM - 1:00 PM | Afternoon: 2:00 PM - 5:00 PM</p>
          <p style={{ marginBottom: '20px' }}>Each session: 50 minutes | Bookings available for next 7 days</p>
          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ opacity: 0.8 }}>Specialized in treating Back Pain, Neck Pain, Knee Pain, Shoulder Pain, and Sports Injuries</p>
            <p style={{ opacity: 0.7, marginTop: '20px', fontSize: '0.9em' }}>📱 Indian Mobile Numbers Only • OTP Verified Accounts • Min 8 Char Password • Secure Booking System</p>
          </div>
          <p style={{ opacity: 0.7, marginTop: '30px' }}>© 2024 Pain Rehab Clinic. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '12px 24px',
  background: '#e67e22',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '1em',
  fontWeight: '500',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s'
};

const navLinkStyle = {
  color: '#333',
  textDecoration: 'none',
  fontSize: '1em',
  fontWeight: '500',
  transition: 'color 0.3s'
};

const formGroupStyle = {
  marginBottom: '25px'
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  border: '2px solid #ddd',
  borderRadius: '8px',
  fontSize: '1em',
  marginTop: '8px',
  outline: 'none',
  transition: 'border-color 0.3s'
};

export default App;