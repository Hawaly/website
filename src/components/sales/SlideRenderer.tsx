"use client";

import { memo, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  GripVertical, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  ArrowDown,
  Target,
  TrendingUp,
  Workflow,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Quote,
  Star,
  User,
  Users,
  Heart,
  Award,
  Linkedin,
  Mail,
  Play,
  Video,
} from "lucide-react";

interface SlideRendererProps {
  slide: any;
  isEditing?: boolean;
  selectedElement?: number | null;
  onSelectElement?: (index: number) => void;
  onUpdateElement?: (elementId: number, updates: any) => void;
  onDeleteElement?: (elementId: number) => void;
}

// Palette urstory.ch - Orange principal
const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#fff7ed"];

export default function SlideRenderer({
  slide,
  isEditing = false,
  selectedElement = null,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: SlideRendererProps) {
  const elements = slide.content?.elements || [];

  if (elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-slate-400 text-center">
          Aucun élément. <br />
          Ajoutez du contenu en utilisant la barre d'outils ci-dessous.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {elements.map((element: any, index: number) => (
        <div
          key={element.id}
          onClick={() => isEditing && onSelectElement?.(index)}
          className={`relative ${
            isEditing
              ? "cursor-pointer transition-all hover:ring-2 hover:ring-brand-orange/50 rounded-lg p-2"
              : ""
          } ${
            selectedElement === index
              ? "ring-2 ring-brand-orange rounded-lg p-2"
              : ""
          }`}
        >
          {isEditing && selectedElement === index && (
            <div className="absolute -left-8 top-2 text-slate-400 cursor-move">
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          <ElementRenderer element={element} />
        </div>
      ))}
    </div>
  );
}

function ElementRenderer({ element }: { element: any }) {
  switch (element.type) {
    case "heading":
      return <HeadingElement element={element} />;
    case "text":
      return <TextElement element={element} />;
    case "list":
      return <ListElement element={element} />;
    case "barChart":
      return <BarChartElement element={element} />;
    case "lineChart":
      return <LineChartElement element={element} />;
    case "pieChart":
      return <PieChartElement element={element} />;
    case "image":
      return <ImageElement element={element} />;
    case "separator":
      return <SeparatorElement element={element} />;
    case "badge":
      return <BadgeElement element={element} />;
    case "callout":
      return <CalloutElement element={element} />;
    case "columns":
      return <ColumnsElement element={element} />;
    case "timeline":
      return <TimelineElement element={element} />;
    case "process":
      return <ProcessElement element={element} />;
    case "comparison":
      return <ComparisonElement element={element} />;
    case "featureGrid":
      return <FeatureGridElement element={element} />;
    case "metricCard":
      return <MetricCardElement element={element} />;
    case "arrow":
      return <ArrowElement element={element} />;
    case "shape":
      return <ShapeElement element={element} />;
    case "quote":
      return <QuoteElement element={element} />;
    case "testimonial":
      return <TestimonialElement element={element} />;
    case "teamCard":
      return <TeamCardElement element={element} />;
    case "statCounter":
      return <StatCounterElement element={element} />;
    case "iconList":
      return <IconListElement element={element} />;
    case "progressBar":
      return <ProgressBarElement element={element} />;
    case "logoGrid":
      return <LogoGridElement element={element} />;
    case "videoPortfolio":
      return <VideoPortfolioElement element={element} />;
    default:
      return null;
  }
}

function HeadingElement({ element }: { element: any }) {
  const Tag = element.level || "h2";
  const sizeClasses = {
    h1: "text-5xl md:text-6xl",
    h2: "text-4xl md:text-5xl",
    h3: "text-3xl md:text-4xl",
    h4: "text-2xl md:text-3xl",
  };

  return (
    <Tag
      className={`font-bold ${sizeClasses[Tag as keyof typeof sizeClasses] || "text-4xl"} ${
        element.color || "text-white"
      } text-${element.align || "center"} leading-tight mb-6`}
    >
      {element.text}
    </Tag>
  );
}

function TextElement({ element }: { element: any }) {
  return (
    <p
      className={`${element.fontSize || "text-lg"} ${element.color || "text-slate-300"} text-${
        element.align || "left"
      } ${element.fontWeight === "bold" ? "font-bold" : ""} leading-relaxed mb-4`}
    >
      {element.text}
    </p>
  );
}

function ListElement({ element }: { element: any }) {
  const ListTag = element.style === "numbered" ? "ol" : "ul";
  const listClass =
    element.style === "numbered"
      ? "list-decimal list-inside"
      : "list-disc list-inside";

  return (
    <ListTag className={`${listClass} space-y-3 ${element.color || "text-slate-300"} mb-6`}>
      {element.items.map((item: string, index: number) => (
        <li key={index} className="text-lg md:text-xl leading-relaxed">
          {item}
        </li>
      ))}
    </ListTag>
  );
}

function BarChartElement({ element }: { element: any }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/50 mb-6">
      {element.title && (
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          {element.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={element.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            style={{ fontSize: '14px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            style={{ fontSize: '14px', fontWeight: '500' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "2px solid #f97316",
              borderRadius: "12px",
              color: "#fff",
              fontSize: '14px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar 
            dataKey={element.dataKey || "value"} 
            fill={element.color || "#f97316"} 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChartElement({ element }: { element: any }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/50 mb-6">
      {element.title && (
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          {element.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={element.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            style={{ fontSize: '14px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            style={{ fontSize: '14px', fontWeight: '500' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "2px solid #f97316",
              borderRadius: "12px",
              color: "#fff",
              fontSize: '14px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line
            type="monotone"
            dataKey={element.dataKey || "value"}
            stroke={element.color || "#f97316"}
            strokeWidth={4}
            dot={{ fill: element.color || "#f97316", r: 6, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieChartElement({ element }: { element: any }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/50 mb-6">
      {element.title && (
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          {element.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={element.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
          >
            {element.data.map((_entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "2px solid #f97316",
              borderRadius: "12px",
              color: "#fff",
              fontSize: '14px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ImageElement({ element }: { element: any }) {
  if (!element.url) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-8 text-center border-2 border-dashed border-slate-700">
        <p className="text-slate-400">Aucune image - Cliquez pour ajouter</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <img
        src={element.url}
        alt={element.alt || "Image"}
        className={`${element.width || "w-full"} ${element.rounded || "rounded-lg"} object-cover shadow-lg`}
      />
    </div>
  );
}

function SeparatorElement({ element }: { element: any }) {
  const styleMap = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  };

  return (
    <hr
      className={`my-8 ${element.color || "border-brand-orange"} ${
        element.thickness || "border-2"
      } ${styleMap[element.style as keyof typeof styleMap] || "border-solid"} opacity-50`}
    />
  );
}

function BadgeElement({ element }: { element: any }) {
  return (
    <div className="flex justify-center my-4">
      <span
        className={`inline-flex items-center px-6 py-3 rounded-full text-base md:text-lg font-bold shadow-lg ${
          element.color || "bg-brand-orange"
        } ${element.textColor || "text-white"} uppercase tracking-wide`}
      >
        {element.text || "Badge"}
      </span>
    </div>
  );
}

function CalloutElement({ element }: { element: any }) {
  const typeStyles = {
    info: {
      bg: "bg-blue-500/20",
      border: "border-blue-500",
      text: "text-blue-200",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-green-500/20",
      border: "border-green-500",
      text: "text-green-200",
      icon: CheckCircle,
    },
    warning: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500",
      text: "text-yellow-200",
      icon: AlertTriangle,
    },
    error: {
      bg: "bg-red-500/20",
      border: "border-red-500",
      text: "text-red-200",
      icon: XCircle,
    },
  };

  const style = typeStyles[element.type as keyof typeof typeStyles] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-4 p-6 rounded-xl border-l-4 ${
        style.bg
      } ${style.border} backdrop-blur-sm mb-6`}
    >
      <Icon className={`h-6 w-6 ${style.text} flex-shrink-0 mt-1`} />
      <p className={`${style.text} text-lg md:text-xl leading-relaxed font-medium`}>{element.text}</p>
    </div>
  );
}

function ColumnsElement({ element }: { element: any }) {
  const columnClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={`grid ${
        columnClass[element.columnCount as keyof typeof columnClass] || "grid-cols-1 md:grid-cols-2"
      } gap-6 mb-6`}
    >
      {element.columns?.map((col: any, index: number) => (
        <div key={index} className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-brand-orange/50 transition-colors">
          <p className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{col.content}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineElement({ element }: { element: any }) {
  const isHorizontal = element.orientation === "horizontal";
  
  return (
    <div className="mb-8">
      <div className={`flex ${isHorizontal ? "flex-row overflow-x-auto pb-4" : "flex-col"} gap-6`}>
        {element.items?.map((item: any, index: number) => (
          <div key={index} className={`relative ${isHorizontal ? "min-w-[250px]" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-brand-orange border-4 border-slate-800 shadow-lg" />
                {index < element.items.length - 1 && (
                  <div className={`${
                    isHorizontal ? "hidden" : "w-0.5 h-16 bg-gradient-to-b from-brand-orange to-slate-700"
                  }`} />
                )}
              </div>
              <div className="flex-1 bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                <div className="text-sm text-brand-orange font-semibold mb-2">{item.date}</div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-slate-300 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessElement({ element }: { element: any }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {element.steps?.map((step: any, index: number) => (
          <div key={index} className="flex items-center gap-4 flex-1">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-xl border-4 border-slate-800">
                <span className="text-2xl font-bold text-white">{step.number}</span>
              </div>
              <div className="mt-4 text-center max-w-[200px]">
                <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                <p className="text-sm text-slate-300">{step.description}</p>
              </div>
            </div>
            {index < element.steps.length - 1 && (
              <ArrowRight className="hidden md:block h-8 w-8 text-brand-orange flex-shrink-0" />
            )}
            {index < element.steps.length - 1 && (
              <ArrowDown className="md:hidden h-8 w-8 text-brand-orange" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonElement({ element }: { element: any }) {
  return (
    <div className="mb-8">
      {element.title && (
        <h3 className="text-3xl font-bold text-white mb-6 text-center">{element.title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {element.items?.map((item: any, index: number) => (
          <div 
            key={index} 
            className="bg-slate-800/40 rounded-xl p-6 border-2 border-slate-700/50 hover:border-brand-orange/50 transition-all"
          >
            <h4 className="text-2xl font-bold text-brand-orange mb-4 text-center">{item.label}</h4>
            <ul className="space-y-3">
              {item.features?.map((feature: string, fIndex: number) => (
                <li key={fIndex} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureGridElement({ element }: { element: any }) {
  const iconMap: Record<string, any> = {
    Target,
    TrendingUp,
    Workflow,
    AlertCircle,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {element.features?.map((feature: any, index: number) => {
        const Icon = iconMap[feature.icon] || Target;
        return (
          <div 
            key={index} 
            className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-brand-orange/50 transition-all text-center group"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-orange/20 flex items-center justify-center group-hover:bg-brand-orange/30 transition-colors">
              <Icon className="h-7 w-7 text-brand-orange" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
            <p className="text-sm text-slate-300">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}

function MetricCardElement({ element }: { element: any }) {
  const trendIcon = element.trend === "up" ? ArrowUpRight : element.trend === "down" ? ArrowDownRight : null;
  const TrendIcon = trendIcon;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-xl mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{element.label}</div>
          <div className={`text-6xl font-bold ${element.color || "text-brand-orange"} mb-2`}>
            {element.value}
          </div>
        </div>
        {TrendIcon && (
          <div className={`p-3 rounded-xl ${
            element.trend === "up" ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            <TrendIcon className={`h-8 w-8 ${
              element.trend === "up" ? "text-green-400" : "text-red-400"
            }`} />
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowElement({ element }: { element: any }) {
  const directionMap: Record<string, any> = {
    right: ArrowRight,
    down: ArrowDown,
    up: ArrowUpRight,
  };
  
  const Icon = directionMap[element.direction] || ArrowRight;

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex items-center gap-2">
        {element.label && <span className="text-slate-300 font-medium">{element.label}</span>}
        <Icon className={`h-12 w-12 ${element.color || "text-brand-orange"}`} />
      </div>
    </div>
  );
}

function ShapeElement({ element }: { element: any }) {
  const shapeClasses = {
    rectangle: "rounded-xl",
    circle: "rounded-full aspect-square",
    pill: "rounded-full",
  };

  return (
    <div className="flex justify-center my-6">
      <div 
        className={`${
          element.color || "bg-brand-orange"
        } ${element.textColor || "text-white"} ${
          shapeClasses[element.type as keyof typeof shapeClasses] || "rounded-xl"
        } px-8 py-6 shadow-xl border-2 border-slate-700/50 min-w-[200px] text-center`}
      >
        <span className="text-xl font-bold">{element.text}</span>
      </div>
    </div>
  );
}

function QuoteElement({ element }: { element: any }) {
  const styleClasses = {
    modern: "border-l-4 border-brand-orange pl-6 italic",
    classic: "text-center",
    minimal: "border-l-2 border-slate-600 pl-4",
  };

  return (
    <div className="my-8">
      <div className={styleClasses[element.style as keyof typeof styleClasses] || styleClasses.modern}>
        <Quote className="h-10 w-10 text-brand-orange/30 mb-4" />
        <p className="text-2xl md:text-3xl text-slate-200 font-light leading-relaxed mb-4">
          "{element.text}"
        </p>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">{element.author}</p>
          {element.role && <p className="text-sm text-slate-400">{element.role}</p>}
        </div>
      </div>
    </div>
  );
}

function TestimonialElement({ element }: { element: any }) {
  return (
    <div className="my-6">
      <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-start gap-6">
          {element.photo ? (
            <img src={element.photo} alt={element.author} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex gap-1 mb-3">
              {[...Array(element.rating || 5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-lg text-slate-200 mb-4 italic">"{element.text}"</p>
            <div>
              <p className="font-semibold text-white">{element.author}</p>
              {element.company && <p className="text-sm text-slate-400">{element.company}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCardElement({ element }: { element: any }) {
  return (
    <div className="my-6">
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-700/50 text-center hover:border-brand-orange/50 transition-all group">
        {element.photo ? (
          <img src={element.photo} alt={element.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
        )}
        <h3 className="text-xl font-bold text-white mb-1">{element.name}</h3>
        <p className="text-brand-orange text-sm mb-3">{element.role}</p>
        {element.bio && <p className="text-slate-300 text-sm mb-4">{element.bio}</p>}
        {element.linkedin && (
          <a href={element.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

function StatCounterElement({ element }: { element: any }) {
  const iconMap: Record<string, any> = {
    Users,
    Heart,
    TrendingUp,
    Target,
    Award,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {element.stats?.map((stat: any, index: number) => {
        const Icon = iconMap[stat.icon] || Award;
        return (
          <div key={index} className="text-center">
            <div className="mb-3">
              <Icon className="h-10 w-10 mx-auto text-brand-orange" />
            </div>
            <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function IconListElement({ element }: { element: any }) {
  return (
    <div className="my-6 space-y-4">
      {element.items?.map((item: any, index: number) => (
        <div key={index} className="flex items-start gap-4 p-4 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors">
          <Check className={`h-6 w-6 flex-shrink-0 ${item.color || "text-green-400"}`} />
          <p className="text-lg text-slate-200">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function ProgressBarElement({ element }: { element: any }) {
  return (
    <div className="my-8 space-y-6">
      {element.bars?.map((bar: any, index: number) => (
        <div key={index}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">{bar.label}</span>
            <span className="text-sm text-slate-400">{bar.value}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${bar.color || "bg-brand-orange"} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${bar.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogoGridElement({ element }: { element: any }) {
  return (
    <div className="my-8">
      {element.title && (
        <h3 className="text-2xl font-bold text-white mb-8 text-center">{element.title}</h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {element.logos?.map((logo: any, index: number) => (
          <div key={index} className="flex items-center justify-center p-6 bg-slate-800/20 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors">
            {logo.url ? (
              <img src={logo.url} alt={logo.name} className="max-h-12 w-auto grayscale hover:grayscale-0 transition-all" />
            ) : (
              <span className="text-slate-400 font-medium">{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPortfolioElement({ element }: { element: any }) {
  const columns = element.columns || 2;
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className="my-8">
      {element.title && (
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">{element.title}</h3>
      )}
      <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[2]} gap-6`}>
        {element.videos?.map((video: any, index: number) => (
          <div
            key={index}
            className="group overflow-hidden rounded-2xl border-2 border-slate-700/50 bg-slate-800/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-brand-orange/50 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="p-4 space-y-4">
              {/* Video Player */}
              <PitchDeckVideoPlayer videoId={video.videoId} title={video.title} />

              {/* Video Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-semibold text-white line-clamp-2">{video.title}</h4>
                  {video.badge && (
                    <span className="flex-shrink-0 px-2.5 py-1 bg-brand-orange/20 text-brand-orange text-xs font-semibold rounded-full border border-brand-orange/30">
                      {video.badge}
                    </span>
                  )}
                </div>
                {video.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchDeckVideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseEnter = () => {
    if (isPlaying) {
      setShowControls(true);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 aspect-video"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Play button overlay - visible uniquement quand la vidéo n'a pas été démarrée */}
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer group/play"
          aria-label="Play video"
        >
          <div className="relative">
            {/* Glow effect animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-60 animate-pulse scale-150" />
            
            {/* Play button avec design amélioré */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl border-4 border-white/80 transition-all duration-300 group-hover/play:scale-125 group-hover/play:shadow-[0_0_60px_rgba(249,115,22,0.8)] group-hover/play:border-white">
              <Play className="h-10 w-10 text-white ml-1.5" fill="currentColor" />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/50 animate-ping" />
          </div>
          {/* Thumbnail Vimeo */}
          <img 
            src={`https://vumbnail.com/${videoId}.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
        </button>
      )}
      
      {/* Vimeo iframe - chargé seulement après le clic */}
      {isPlaying && (
        <>
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1&loop=0&byline=0&title=0&portrait=0&controls=0`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title={title}
            className="absolute inset-0 h-full w-full rounded-xl"
            allowFullScreen
          />
          
          {/* Custom controls overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
              showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-md px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Video title */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{title}</p>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-2">
                  {/* Fullscreen button */}
                  <button
                    onClick={handleFullscreen}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/50 transition-all duration-200 hover:scale-110"
                    aria-label="Fullscreen"
                  >
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
