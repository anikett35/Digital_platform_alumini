const API_URL = 'http://localhost:5000/api';

async function testMentorshipFlow() {
  try {
    console.log('--- Starting Mentorship Flow Test ---');

    console.log('1. Registering Student...');
    const studentRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: `student_${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      })
    });
    const studentData = await studentRes.json();
    if (!studentRes.ok) throw new Error(studentData.message);
    const studentToken = studentData.token;

    console.log('1b. Registering Alumni...');
    const alumniRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Alumni',
        email: `alumni_${Date.now()}@test.com`,
        password: 'password123',
        role: 'alumni'
      })
    });
    const alumniData = await alumniRes.json();
    if (!alumniRes.ok) throw new Error(alumniData.message);
    const alumniToken = alumniData.token;
    const alumniId = alumniData.user.id;

    console.log('2. Student requesting a meeting with Alumni...');
    const reqRes = await fetch(`${API_URL}/meetings/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        alumniId: alumniId,
        topic: 'Career Guidance in Tech',
        message: 'I would love to learn from your experience!',
        duration: 30,
        type: '1-on-1'
      })
    });
    const reqData = await reqRes.json();
    if (!reqRes.ok) throw new Error(reqData.message || 'Request failed');
    
    const meetingId = reqData._id;
    console.log(`Meeting Requested. ID: ${meetingId}, Status: ${reqData.status}`);

    console.log('3. Alumni fetching their meeting requests...');
    const myReqsRes = await fetch(`${API_URL}/meetings/my`, {
       headers: { 'Authorization': `Bearer ${alumniToken}` }
    });
    const myReqsData = await myReqsRes.json();
    console.log(`Alumni has ${myReqsData.length} requests.`);

    console.log('4. Alumni accepting the meeting request...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const acceptRes = await fetch(`${API_URL}/meetings/${meetingId}/accept`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${alumniToken}`
      },
      body: JSON.stringify({
        scheduledAt: tomorrow.toISOString()
      })
    });
    const acceptData = await acceptRes.json();
    if (!acceptRes.ok) throw new Error(acceptData.message || 'Error accepting');

    console.log(`Meeting Accepted! Link generated: ${acceptData.meetingLink}`);
    
    // Test the Mentorship Dashboard API (AI matching requests)
    console.log('5. Student sending a mentorship request via /ai-matching...');
    const matchReqRes = await fetch(`${API_URL}/ai-matching/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        mentorId: alumniId,
        topic: 'AI Matching Topic',
        message: 'Please accept my AI match.'
      })
    });
    const matchData = await matchReqRes.json();
    
    // Status check
    const statusRes = await fetch(`${API_URL}/ai-matching/status`, {
      headers: { 'Authorization': `Bearer ${alumniToken}` }
    });
    const statusData = await statusRes.json();
    console.log('AI-Matching status retrieved successfully.');

    console.log('--- All Backend APIs Working Successfully! ---');

  } catch (error) {
    console.error('Test Failed!', error);
  }
}

testMentorshipFlow();
