import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [course, setCourse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const txnId = generateTransactionId();
      
      const response = await fetch('/api/enrollments/payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          course: courseId,
          amount: course.price,
          payment_method: 'MOCK_PAYMENT',
          transaction_id: txnId,
          status: 'COMPLETED'
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      setTransactionId(txnId);
      setSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/student/my-courses');
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#94C705] mx-auto mb-4"></div>
          <p className="text-[#999999]">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center p-12 bg-[#161616] border-2 border-[#252525] rounded-3xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
          <p className="text-xl text-[#999999] mb-8">
            You've successfully enrolled in {course.title}
          </p>

          <div className="p-6 bg-[#0F0F0F] rounded-2xl mb-8 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#666666] mb-1">Transaction ID</p>
                <p className="text-white font-mono">{transactionId}</p>
              </div>
              <div>
                <p className="text-[#666666] mb-1">Amount Paid</p>
                <p className="text-white font-bold text-2xl">${course.price}</p>
              </div>
              <div>
                <p className="text-[#666666] mb-1">Payment Method</p>
                <p className="text-white">Mock Payment</p>
              </div>
              <div>
                <p className="text-[#666666] mb-1">Date</p>
                <p className="text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <p className="text-[#999999] mb-6">
            Redirecting to My Courses in a few seconds...
          </p>
          
          <Button onClick={() => navigate('/student/my-courses')} variant="primary">
            Go to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white">Complete Your Purchase</h1>
          <p className="text-[#999999] mt-2">Secure mock payment simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Payment Section */}
        <div className="col-span-2">
          <div className="space-y-6">
            {/* Mock Payment Info */}
            <div className="p-6 bg-[#161616] border-2 border-[#252525] rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6">Mock Payment</h2>
              
              <div className="p-6 bg-[#0F0F0F] rounded-2xl text-center mb-6">
                <Wallet size={64} className="mx-auto mb-4 text-[#94C705]" />
                <h3 className="text-xl font-bold text-white mb-2">Simulated Payment System</h3>
                <p className="text-[#666666] mb-4">
                  This is a demonstration payment system. Click the button below to simulate a successful payment and enroll in the course.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#94C705]/10 border border-[#94C705]/30 rounded-lg">
                  <CheckCircle size={20} className="text-[#94C705]" />
                  <span className="text-[#94C705] font-medium">No actual payment required</span>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-[#0F0F0F] rounded-2xl">
                <div className="flex items-center gap-3 text-[#999999]">
                  <CheckCircle size={20} className="text-[#94C705]" />
                  <span>Instant enrollment</span>
                </div>
                <div className="flex items-center gap-3 text-[#999999]">
                  <CheckCircle size={20} className="text-[#94C705]" />
                  <span>No payment information needed</span>
                </div>
                <div className="flex items-center gap-3 text-[#999999]">
                  <CheckCircle size={20} className="text-[#94C705]" />
                  <span>Immediate access to all course content</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl">
              <p className="text-blue-400 text-sm">
                <strong>Demo Mode:</strong> This platform uses mock payments for demonstration purposes. 
                In a production environment, this would integrate with real payment gateways like Stripe or PayPal.
              </p>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              variant="primary"
              loading={processing}
              fullWidth
              icon={CreditCard}
              size="lg"
            >
              {processing ? 'Processing...' : `Complete Mock Payment - $${course?.price}`}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 bg-[#161616] border-2 border-[#252525] rounded-3xl sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            {course?.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-40 object-cover rounded-2xl mb-4"
              />
            )}

            <h3 className="text-xl font-bold text-white mb-2">{course?.title}</h3>
            <p className="text-[#999999] mb-6 line-clamp-3">{course?.description}</p>

            <div className="space-y-4 pt-4 border-t border-[#252525]">
              <div className="flex justify-between items-center">
                <span className="text-[#999999]">Course Price</span>
                <span className="text-white font-bold">${course?.price}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#999999]">Processing Fee</span>
                <span className="text-white">$0.00</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#252525]">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-3xl font-bold text-[#94C705]">${course?.price}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#0F0F0F] rounded-2xl">
              <p className="text-sm text-[#666666]">
                ✓ Lifetime access<br />
                ✓ All lessons and materials<br />
                ✓ Assignments and quizzes<br />
                ✓ Certificate of completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
