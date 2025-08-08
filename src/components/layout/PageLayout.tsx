import { ReactNode } from 'react';
import { BackgroundGraph } from "@/components/ui/background-graph";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  titleColors?: string;
  showBackButton?: boolean;
  backPath?: string;
  headerActions?: ReactNode;
  glitchColors?: string[];
}

export const PageLayout = ({ 
  children, 
  title, 
  titleColors = "from-cyber-purple to-cyber-magenta",
  showBackButton = true,
  backPath = "/dashboard",
  headerActions,
  glitchColors = ["#8B5CF6", "#A855F7", "#C084FC"]
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <BackgroundGraph className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  onClick={() => navigate(backPath)}
                  className="text-primary hover:text-primary/80 hover:bg-muted/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {headerActions}
              <ThemeToggle />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};