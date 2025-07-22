'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Performance monitoring for Core Web Vitals
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production and if performance API is available
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    const metrics: Partial<PerformanceMetrics> = {};

    // Measure TTFB (Time to First Byte)
    const measureTTFB = () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
      }
    };

    // Measure FCP (First Contentful Paint)
    const measureFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }
    };

    // Measure LCP (Largest Contentful Paint)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        });
        
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP not supported
        }
      }
    };

    // Measure FID (First Input Delay)
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        
        try {
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID not supported
        }
      }
    };

    // Measure CLS (Cumulative Layout Shift)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          metrics.cls = clsScore;
        });
        
        try {
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // CLS not supported
        }
      }
    };

    // Send metrics to analytics (replace with your analytics service)
    const sendMetrics = () => {
      // Only send if we have meaningful data
      if (Object.keys(metrics).length > 0) {
        // Example: Send to your analytics service
        // analytics.track('performance_metrics', metrics);
        
        // For development, log to console
        if (process.env.NODE_ENV === 'development') {
          console.log('Performance Metrics:', metrics);
          
          // Provide performance recommendations
          const recommendations = [];
          
          if (metrics.fcp && metrics.fcp > 2500) {
            recommendations.push('FCP is slow - consider optimizing critical resources');
          }
          
          if (metrics.lcp && metrics.lcp > 4000) {
            recommendations.push('LCP is slow - optimize largest contentful element');
          }
          
          if (metrics.fid && metrics.fid > 100) {
            recommendations.push('FID is slow - reduce JavaScript execution time');
          }
          
          if (metrics.cls && metrics.cls > 0.25) {
            recommendations.push('CLS is high - fix layout shifts');
          }
          
          if (recommendations.length > 0) {
            console.warn('Performance Recommendations:', recommendations);
          }
        }
      }
    };

    // Initialize measurements
    measureTTFB();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();

    // Send metrics after page load
    const sendMetricsTimer = setTimeout(sendMetrics, 5000);

    // Cleanup
    return () => {
      clearTimeout(sendMetricsTimer);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Resource loading performance monitor
export function ResourceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    const monitorResources = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Analyze large resources
      const largeResources = resources.filter(resource => 
        resource.transferSize > 100000 // > 100KB
      );
      
      // Analyze slow resources
      const slowResources = resources.filter(resource => 
        resource.duration > 1000 // > 1 second
      );
      
      if (process.env.NODE_ENV === 'development') {
        if (largeResources.length > 0) {
          console.warn('Large Resources (>100KB):', 
            largeResources.map(r => ({
              name: r.name,
              size: Math.round(r.transferSize / 1024) + 'KB',
              duration: Math.round(r.duration) + 'ms'
            }))
          );
        }
        
        if (slowResources.length > 0) {
          console.warn('Slow Resources (>1s):', 
            slowResources.map(r => ({
              name: r.name,
              duration: Math.round(r.duration) + 'ms'
            }))
          );
        }
      }
    };

    // Monitor resources after initial load
    const timer = setTimeout(monitorResources, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

// Combined performance monitoring component
export default function PerformanceTracker() {
  return (
    <>
      <PerformanceMonitor />
      <ResourceMonitor />
    </>
  );
}