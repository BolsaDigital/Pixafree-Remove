'use client';

import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const faqsContent = [
  {
    question: 'What image formats does your background remover support?',
    answer:
      'Our app supports popular image formats including JPG, JPEG, PNG, and WebP. Processed images can be downloaded in PNG for transparency.',
  },
  {
    question: 'How do I remove a background from an image?',
    answer:
      'Upload your image, wait for AI processing (typically 2-10 seconds), preview the result, then download the background-free image. No manual editing is required!',
  },
  {
    question: 'Is my uploaded data secure and private?',
    answer:
      'Yes! Uploaded images are automatically deleted from our servers within 24 hours. We never store, share, or use your content for training AI models.',
  },
  {
    question: 'What’s the maximum image size I can process?',
    answer:
      'You can upload images up to 5MB in size. For larger files, consider compressing them before uploading. We recommend using JPG or PNG formats for best results.',
  },
  {
    question: 'Do you offer a free Credits?',
    answer:
      'Yes! You can download up to 5 HD images for free per month. After that, you can purchase credits or subscribe to a plan for unlimited access.',
  },
  {
    question: 'How does subscription billing work?',
    answer:
      'Plans are billed monthly or annually. Cancel anytime via your dashboard. We offer prorated refunds for annual plans canceled within 30 days.',
  },
  {
    question: 'Is the app mobile-friendly?',
    answer:
      'Absolutely! Our web app works seamlessly on all devices. Save the site to your home screen for one-tap access, just like a native mobile app.',
  },
];

const FaqSection = () => {
  return (
    <section className={'w-full bg-gradient-to-b from-transparent via-muted/20 to-transparent'}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-semibold mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about our platform
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-2">
          {faqsContent.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Internal FaqItem component
const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        'group rounded-lg bg-accent/30',
        'transition-all duration-200 ease-in-out',
        'border border-border/50',
        isOpen
          ? 'bg-gradient-to-br from-background via-muted/50 to-background'
          : 'hover:bg-muted/50',
      )}
    >
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 h-auto justify-between hover:bg-transparent"
      >
        <h3
          className={cn(
            'text-base font-medium text-wrap transition-colors duration-200 text-left',
            'text-foreground/70',
            isOpen && 'text-foreground',
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'p-0.5 rounded-full flex-shrink-0',
            'transition-colors duration-200',
            isOpen ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: 'easeIn' },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = 'FaqItem';

export { FaqSection };
