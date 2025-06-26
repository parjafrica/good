import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, ArrowRight, ArrowLeft, User, Building, Target, MapPin } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

interface OnboardingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationType: string;
  organizationName: string;
  position: string;
  organizationSize: string;
  country: string;
  region: string;
  focusSectors: string[];
  fundingExperience: string;
  annualBudget: string;
  primaryFundingGoals: string[];
  currentProjects: string;
  challengesFaced: string;
  successMetrics: string;
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Organization', icon: Building, description: 'Your organization details' },
  { id: 3, title: 'Focus Areas', icon: Target, description: 'What sectors do you work in?' },
  { id: 4, title: 'Funding Goals', icon: MapPin, description: 'Your funding objectives' },
];

const organizationTypes = [
  'Non-Profit Organization',
  'Social Enterprise',
  'Community Group',
  'Research Institution',
  'Educational Institution',
  'Healthcare Organization',
  'Environmental Organization',
  'Human Rights Organization',
  'Development Agency',
  'Government Agency',
  'International NGO',
  'Faith-Based Organization',
  'Other'
];

const organizationSizes = [
  '1-5 employees',
  '6-20 employees',
  '21-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees'
];

const countries = [
  'Uganda', 'Kenya', 'South Sudan', 'Tanzania', 'Rwanda', 'Ethiopia', 'Somalia', 'Burundi',
  'Democratic Republic of Congo', 'Sudan', 'South Africa', 'Nigeria', 'Ghana', 'Senegal',
  'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Central African Republic', 'Cameroon',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Other'
];

const sectors = [
  'Education', 'Healthcare', 'Water & Sanitation', 'Agriculture', 'Environment',
  'Human Rights', 'Gender Equality', 'Youth Development', 'Economic Development',
  'Technology', 'Research', 'Arts & Culture', 'Emergency Response', 'Peacebuilding',
  'Governance', 'Infrastructure', 'Energy', 'Food Security', 'Climate Change'
];

const fundingExperienceLevels = [
  'New to grant writing (0-1 years)',
  'Some experience (1-3 years)',
  'Experienced (3-7 years)',
  'Very experienced (7+ years)',
  'Expert level (10+ years)'
];

const budgetRanges = [
  'Under $10,000',
  '$10,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000 - $500,000',
  '$500,000 - $1M',
  'Over $1M'
];

const fundingGoals = [
  'Program Expansion', 'Capacity Building', 'Research & Development', 'Infrastructure',
  'Emergency Response', 'Community Development', 'Advocacy & Policy', 'Technology Innovation',
  'Partnership Development', 'Sustainability Projects', 'Training & Education'
];

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      organizationType: '',
      organizationName: '',
      position: '',
      organizationSize: '',
      country: '',
      region: '',
      focusSectors: [],
      fundingExperience: '',
      annualBudget: '',
      primaryFundingGoals: [],
      currentProjects: '',
      challengesFaced: '',
      successMetrics: ''
    }
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email'];
      case 2:
        return ['organizationType', 'organizationName', 'position', 'organizationSize'];
      case 3:
        return ['country', 'focusSectors'];
      case 4:
        return ['fundingExperience', 'annualBudget', 'primaryFundingGoals', 'currentProjects', 'challengesFaced'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // Update form data with selected arrays
      data.focusSectors = selectedSectors;
      data.primaryFundingGoals = selectedGoals;

      // Save onboarding data to backend
      const response = await fetch('/api/user/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Onboarding completed successfully');
        setLocation('/dashboard');
      } else {
        console.error('Error saving onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
    }
  };

  const toggleSector = (sector: string) => {
    const updated = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(updated);
    form.setValue('focusSectors', updated);
  };

  const toggleGoal = (goal: string) => {
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(updated);
    form.setValue('primaryFundingGoals', updated);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Granada OS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let's get to know you and your organization better
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-24 mx-4 transition-all ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                {steps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Organization Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="organizationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select organization type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {organizationTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="organizationSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Size *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select organization size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {organizationSizes.map((size) => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your organization name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Position *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your position/title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Focus Areas & Location */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region/State (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your region or state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="focusSectors"
                        render={() => (
                          <FormItem>
                            <FormLabel>Focus Sectors * (Select all that apply)</FormLabel>
                            <FormDescription>
                              Choose the sectors your organization works in
                            </FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                              {sectors.map((sector) => (
                                <button
                                  key={sector}
                                  type="button"
                                  onClick={() => toggleSector(sector)}
                                  className={`p-3 text-sm rounded-lg border-2 transition-all ${
                                    selectedSectors.includes(sector)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {sector}
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 4: Funding Goals & Project Details */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fundingExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Funding Experience *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select experience level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fundingExperienceLevels.map((level) => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="annualBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Budget Range *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select budget range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {budgetRanges.map((range) => (
                                    <SelectItem key={range} value={range}>{range}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="primaryFundingGoals"
                        render={() => (
                          <FormItem>
                            <FormLabel>Primary Funding Goals * (Select all that apply)</FormLabel>
                            <FormDescription>
                              What do you primarily seek funding for?
                            </FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                              {fundingGoals.map((goal) => (
                                <button
                                  key={goal}
                                  type="button"
                                  onClick={() => toggleGoal(goal)}
                                  className={`p-3 text-sm rounded-lg border-2 transition-all ${
                                    selectedGoals.includes(goal)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {goal}
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentProjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Projects *</FormLabel>
                            <FormDescription>
                              Describe your current projects and initiatives
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your current projects, their scope, and impact..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="challengesFaced"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Challenges & Needs *</FormLabel>
                            <FormDescription>
                              What challenges do you face in securing funding?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the main challenges you face in fundraising and what support you need..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="successMetrics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Success Metrics (Optional)</FormLabel>
                            <FormDescription>
                              How do you measure the success of your projects?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how you measure impact and success..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        Complete Setup
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}