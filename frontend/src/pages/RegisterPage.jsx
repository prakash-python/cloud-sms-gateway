import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Globe, Building2, 
  ArrowRight, Check, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/auth/InputField';
import { PasswordInput } from '../components/auth/PasswordInput';
import AuthSplitLayout from '../layouts/AuthSplitLayout';
import toast from 'react-hot-toast';
import api from '../services/api';

const ValidationItem = ({ label, met }) => (
  <div className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${met ? 'text-emerald-500' : 'text-slate-500'}`}>
    {met ? <Check size={10} strokeWidth={3} /> : <div className="h-1 w-1 rounded-full bg-slate-700" />}
    <span>{label}</span>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '', email: '',
    phone_number: '', country: 'USA', company_name: '',
    password: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const navigate = useNavigate();

  const rules = {
    first_name: /^[A-Za-z]{2,}$/,
    last_name: /^[A-Za-z]+$/,
    username: /^\S{4,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone_number: /^\d{10}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

  const validateField = (name, value) => {
    let error = '';
    let isValid = false;

    if (rules[name]) {
      isValid = rules[name].test(value);
      if (!isValid && value.length > 0) {
        if (name === 'first_name') error = "Alphabets only (min 2)";
        if (name === 'last_name') error = "Alphabets only";
        if (name === 'username') error = "Min 4 chars, no spaces";
        if (name === 'email') error = "Invalid email format";
        if (name === 'phone_number') error = "Exactly 10 digits required";
        if (name === 'password') error = "Security requirements not met";
      }
    }

    if (name === 'confirmPassword') {
      isValid = value === formData.password && value.length > 0;
      if (!isValid && value.length > 0) error = "Passwords do not match";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    setValidFields(prev => ({ ...prev, [name]: isValid }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Input Restrictions
    if (name === 'first_name' || name === 'last_name') {
      if (/[^A-Za-z]/.test(value)) return;
    }
    if (name === 'phone_number') {
      if (/[^0-9]/.test(value) || value.length > 10) return;
    }
    if (name === 'username') {
      if (/\s/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return { label: 'Empty', color: 'slate-500', width: '0%' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[@$!%*?&]/.test(pass)) score++;

    if (score <= 1) return { label: 'Weak', color: 'red-500', width: '33%' };
    if (score <= 3) return { label: 'Medium', color: 'yellow-500', width: '66%' };
    return { label: 'Strong', color: 'emerald-500', width: '100%' };
  };

  const isFormValid = () => {
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'phone_number', 'password', 'confirmPassword'];
    return requiredFields.every(field => validFields[field]) && !Object.values(errors).some(e => e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        if (detail.includes('email')) setErrors(p => ({...p, email: detail}));
        if (detail.includes('username')) setErrors(p => ({...p, username: detail}));
        if (detail.includes('phone')) setErrors(p => ({...p, phone_number: detail}));
      }
      toast.error(detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-slate-400 mt-2 font-medium italic">Join the next generation of SMS infrastructure.</p>
      </div>

      <motion.form 
        animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="First Name" name="first_name" icon={User} placeholder="John"
            value={formData.first_name} onChange={handleChange}
            error={errors.first_name} isValid={validFields.first_name}
          />
          <InputField
            label="Last Name" name="last_name" icon={User} placeholder="Doe"
            value={formData.last_name} onChange={handleChange}
            error={errors.last_name} isValid={validFields.last_name}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Username" name="username" icon={User} placeholder="johndoe"
            value={formData.username} onChange={handleChange}
            error={errors.username} isValid={validFields.username}
          />
          <InputField
            label="Email Address" name="email" type="email" icon={Mail} placeholder="john@company.com"
            value={formData.email} onChange={handleChange}
            error={errors.email} isValid={validFields.email}
          />
        </div>

        <InputField
          label="Phone Number" name="phone_number" icon={Phone} placeholder="10 digits"
          inputMode="numeric" pattern="[0-9]*"
          value={formData.phone_number} onChange={handleChange}
          error={errors.phone_number} isValid={validFields.phone_number}
        />

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <PasswordInput
              label="Password" name="password" placeholder="••••••••"
              value={formData.password} onChange={handleChange}
              error={errors.password} isValid={validFields.password}
            />
            {/* Password Strength Meter */}
            <div className="px-1 space-y-1.5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Strength: <span className={`text-${strength.color}`}>{strength.label}</span></span>
                  {strength.label === 'Strong' ? <ShieldCheck size={12} className="text-emerald-500" /> : <ShieldAlert size={12} className="text-red-500/50" />}
               </div>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                    className={`h-full bg-${strength.color} transition-all duration-500 shadow-[0_0_8px] shadow-${strength.color}/50`} 
                  />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
             <ValidationItem label="8+ Characters" met={formData.password.length >= 8} />
             <ValidationItem label="One Uppercase" met={/[A-Z]/.test(formData.password)} />
             <ValidationItem label="One Lowercase" met={/[a-z]/.test(formData.password)} />
             <ValidationItem label="One Digit" met={/\d/.test(formData.password)} />
             <ValidationItem label="Special Char" met={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)} />
          </div>

          <PasswordInput
            label="Confirm Password" name="confirmPassword" placeholder="••••••••"
            value={formData.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} isValid={validFields.confirmPassword}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-sm font-black uppercase tracking-widest rounded-2xl mt-4"
          isLoading={isLoading}
          disabled={!isFormValid() || isLoading}
        >
          Create Account <ArrowRight className="ml-2" size={16} />
        </Button>
      </motion.form>

      <p className="mt-8 text-center text-slate-500 text-sm font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-white font-bold hover:text-blue-500 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
};

export default RegisterPage;
