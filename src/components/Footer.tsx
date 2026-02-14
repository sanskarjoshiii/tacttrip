import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-12">
        {/* Academic Credit */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Academic Project</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Department of Computer Engineering
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            TactTrip – AI Travel Agent © 2024. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
