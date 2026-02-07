import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

export interface PageViewData {
  path: string;
  pageTitle: string;
  enterTime: number;
  exitTime?: number;
  duration: number; // en ms
  clicks: number;
  referrer?: string;
}

export interface ProductViewData {
  productId: string;
  productName: string;
  enterTime: number;
  exitTime?: number;
  duration: number; // en ms
  clicks: number;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  userId?: string; // null si non connecté
  pageViews: PageViewData[];
  productViews: ProductViewData[];
  totalClicks: number;
  totalDuration: number;
  isEmailCollected?: boolean;
  visitorEmail?: string;
}

export interface AnalyticsStats {
  totalSessions: number;
  totalPageViews: number;
  totalProductViews: number;
  totalClicks: number;
  averageSessionDuration: number;
  averageProductDuration: number;
  pageStats: {
    path: string;
    title: string;
    views: number;
    avgDuration: number;
    totalClicks: number;
  }[];
  productStats: {
    productId: string;
    productName: string;
    views: number;
    avgDuration: number;
    totalClicks: number;
  }[];
}

interface AnalyticsContextType {
  // Session management
  currentSession: SessionData | null;
  startSession: (userId?: string) => void;
  endSession: () => void;
  
  // Page tracking
  trackPageView: (path: string, title: string) => void;
  trackPageExit: (path: string) => void;
  
  // Product tracking
  trackProductView: (productId: string, productName: string) => void;
  trackProductExit: (productId: string) => void;
  
  // Click tracking
  trackClick: (path: string, productId?: string) => void;
  
  // Email collection
  collectVisitorEmail: (email: string) => void;
  
  // Stats
  getAllSessions: () => SessionData[];
  getAnalyticsStats: () => AnalyticsStats;
  clearAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Initialize sessions from localStorage
const getInitialSessions = (): SessionData[] => {
  try {
    const saved = localStorage.getItem('analytics_sessions');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<SessionData[]>(getInitialSessions());
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const pageEnterTimeRef = useRef<number>(0);
  const productEnterTimeRef = useRef<number>(0);
  const currentPageRef = useRef<string>('');
  const currentProductRef = useRef<string>('');

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startSession = (userId?: string) => {
    const newSession: SessionData = {
      sessionId: generateSessionId(),
      startTime: Date.now(),
      userId,
      pageViews: [],
      productViews: [],
      totalClicks: 0,
      totalDuration: 0,
    };
    setCurrentSession(newSession);
  };

  const endSession = () => {
    if (currentSession) {
      const updatedSession: SessionData = {
        ...currentSession,
        endTime: Date.now(),
        totalDuration: Date.now() - currentSession.startTime,
      };
      setSessions(prev => [...prev, updatedSession]);
      setCurrentSession(null);
    }
  };

  const trackPageView = (path: string, title: string) => {
    if (!currentSession) startSession();

    const pageView: PageViewData = {
      path,
      pageTitle: title,
      enterTime: Date.now(),
      duration: 0,
      clicks: 0,
    };

    pageEnterTimeRef.current = Date.now();
    currentPageRef.current = path;

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pageViews: [...prev.pageViews, pageView],
      };
    });
  };

  const trackPageExit = (path: string) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;
      const updatedPageViews = [...prev.pageViews];
      const lastPageView = updatedPageViews[updatedPageViews.length - 1];
      
      if (lastPageView && lastPageView.path === path) {
        lastPageView.exitTime = Date.now();
        lastPageView.duration = Date.now() - lastPageView.enterTime;
      }

      return { ...prev, pageViews: updatedPageViews };
    });
  };

  const trackProductView = (productId: string, productName: string) => {
    if (!currentSession) startSession();

    const productView: ProductViewData = {
      productId,
      productName,
      enterTime: Date.now(),
      duration: 0,
      clicks: 0,
    };

    productEnterTimeRef.current = Date.now();
    currentProductRef.current = productId;

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        productViews: [...prev.productViews, productView],
      };
    });
  };

  const trackProductExit = (productId: string) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;
      const updatedProductViews = [...prev.productViews];
      const lastProductView = updatedProductViews[updatedProductViews.length - 1];
      
      if (lastProductView && lastProductView.productId === productId) {
        lastProductView.exitTime = Date.now();
        lastProductView.duration = Date.now() - lastProductView.enterTime;
      }

      return { ...prev, productViews: updatedProductViews };
    });
  };

  const trackClick = (path: string, productId?: string) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;

      let updated = { ...prev, totalClicks: prev.totalClicks + 1 };

      // Update page clicks
      if (currentPageRef.current === path && updated.pageViews.length > 0) {
        const lastPageView = updated.pageViews[updated.pageViews.length - 1];
        if (lastPageView.path === path) {
          lastPageView.clicks += 1;
        }
      }

      // Update product clicks
      if (productId && currentProductRef.current === productId && updated.productViews.length > 0) {
        const lastProductView = updated.productViews[updated.productViews.length - 1];
        if (lastProductView.productId === productId) {
          lastProductView.clicks += 1;
        }
      }

      return updated;
    });
  };

  const collectVisitorEmail = (email: string) => {
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isEmailCollected: true,
          visitorEmail: email,
        };
      });
    }
  };

  const getAllSessions = (): SessionData[] => {
    return [...sessions];
  };

  const getAnalyticsStats = (): AnalyticsStats => {
    const pageStatsMap = new Map<string, { title: string; views: number; durations: number[]; clicks: number }>();
    const productStatsMap = new Map<string, { name: string; views: number; durations: number[]; clicks: number }>();
    let totalClicks = 0;

    sessions.forEach(session => {
      // Page stats
      session.pageViews.forEach(pv => {
        const key = pv.path;
        const existing = pageStatsMap.get(key) || { title: pv.pageTitle, views: 0, durations: [], clicks: 0 };
        existing.views += 1;
        existing.durations.push(pv.duration);
        existing.clicks += pv.clicks;
        pageStatsMap.set(key, existing);
      });

      // Product stats
      session.productViews.forEach(prv => {
        const key = prv.productId;
        const existing = productStatsMap.get(key) || { name: prv.productName, views: 0, durations: [], clicks: 0 };
        existing.views += 1;
        existing.durations.push(prv.duration);
        existing.clicks += prv.clicks;
        productStatsMap.set(key, existing);
      });

      totalClicks += session.totalClicks;
    });

    const pageStats = Array.from(pageStatsMap).map(([path, data]) => ({
      path,
      title: data.title,
      views: data.views,
      avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.views,
      totalClicks: data.clicks,
    }));

    const productStats = Array.from(productStatsMap).map(([productId, data]) => ({
      productId,
      productName: data.name,
      views: data.views,
      avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.views,
      totalClicks: data.clicks,
    }));

    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews.length, 0);
    const totalProductViews = sessions.reduce((sum, s) => sum + s.productViews.length, 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);

    return {
      totalSessions: sessions.length,
      totalPageViews,
      totalProductViews,
      totalClicks,
      averageSessionDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
      averageProductDuration: productStats.length > 0 
        ? productStats.reduce((sum, s) => sum + s.avgDuration, 0) / productStats.length 
        : 0,
      pageStats: pageStats.sort((a, b) => b.views - a.views),
      productStats: productStats.sort((a, b) => b.views - a.views),
    };
  };

  const clearAnalytics = () => {
    setSessions([]);
    localStorage.removeItem('analytics_sessions');
  };

  return (
    <AnalyticsContext.Provider
      value={{
        currentSession,
        startSession,
        endSession,
        trackPageView,
        trackPageExit,
        trackProductView,
        trackProductExit,
        trackClick,
        collectVisitorEmail,
        getAllSessions,
        getAnalyticsStats,
        clearAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
