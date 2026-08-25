import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-center">
      <div>
        <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-primary-soft text-primary mb-5">
          <CompassIcon className="size-7" />
        </div>
        <h1 className="text-3xl font-bold text-ink">Page not found</h1>
        <p className="text-sm text-muted mt-2">The page you're looking for doesn't exist.</p>
        <Button as={Link} to="/" className="mt-6">
          Go home
        </Button>
      </div>
    </div>
  );
}
