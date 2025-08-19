'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export type RequestCategory = 'hire_tutor' | 'hire_quran_tutor' | 'assignment_help' | 'project_help';

type RequestPayload = { title: string; details: string; category: RequestCategory };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: RequestCategory;
  onSubmit?: (payload: RequestPayload) => Promise<void> | void;
}

export function RequestFlow({ open, onOpenChange, defaultCategory, onSubmit }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<RequestCategory>(defaultCategory || 'hire_tutor');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCategory(defaultCategory || 'hire_tutor'); }, [defaultCategory]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = { title, details, category };
      if (onSubmit) await onSubmit(payload);
      else await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      toast({ title: 'Request submitted', description: 'We will review it shortly.' });
      onOpenChange(false);
      setTitle(''); setDetails('');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Submit a request</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Request type</Label>
            <select id="category" className="h-10 w-full rounded-md border border-input bg-background px-3"
              value={category} onChange={(e) => setCategory(e.target.value as RequestCategory)}>
              <option value="hire_tutor">Hire Tutor</option>
              <option value="hire_quran_tutor">Hire Quran Tutor</option>
              <option value="assignment_help">Assignment Help</option>
              <option value="project_help">Project Help</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Need calculus help twice a week" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe your needs, schedule, and budget." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting…' : 'Submit for review'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
