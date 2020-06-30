\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{ross}[2020/06/29 for Circle Z]
\RequirePackage{ifthen}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\LoadClass[11pt,oneside]{article}

%%%%%%%%%%%%%%%%%%%%%%%

\RequirePackage{xcolor}

%%%%%%%%%%%%%%%%%%%%%%%

\RequirePackage{geometry}
    \geometry{%
        top=0.25in,
        bottom=0.25in,
        left=0.25in,
        textwidth=5in,
        paperwidth=8.5in,
        paperheight=11in,
        hmarginratio={1:1},
    }
\RequirePackage{nopageno}
\RequirePackage{amsmath,amsthm,amssymb}
\RequirePackage{enumitem}
\RequirePackage{parskip}

%%%%%%%%%%%%%%%%%%%%%%%%
%"shortcuts"%
%%%%%%%%%%%%%%%%%%%%%%%%

\newcommand{\zz}{\mathbf{Z}}
\newcommand{\qq}{\mathbf{Q}}
\newcommand{\rr}{\mathbf{R}}
\newcommand{\cc}{\mathbf{C}}
\newcommand{\uu}{\mathbf{U}}

\DeclareMathOperator{\oo}{ord}
\DeclareMathOperator{\lcm}{lcm}

%%%%%%%%%%%%%%%%%%%%%%%%%
% problem/solution env  %
%%%%%%%%%%%%%%%%%%%%%%%%%

    \newtheorem*{claim}{Claim}
    \newtheorem{theorem}{Theorem}
    \newtheorem{lemma}[theorem]{Lemma}
    \newtheorem{prop}[theorem]{Proposition}
\theoremstyle{definition}
    \newtheorem{defn}[theorem]{Definition}
    \newtheorem{example}[theorem]{Example}
\theoremstyle{remark}
    \newtheorem{remark}[theorem]{Remark}

\RequirePackage{tcolorbox}
\tcbuselibrary{skins,breakable}

\newcounter{pr@blem}
\setcounter{pr@blem}{1}

\colorlet{prb}{darkgray}
\newenvironment{problem}[1][]{\newpage%
\def\r@f{#1}%
\begin{tcolorbox}[%
    empty,%
    title={\bf \arabic{pr@blem} #1},%
    attach boxed title to top left,%
    boxed title style={empty,%
        size=minimal,%
        toprule=2pt,%
        top=4pt,%
        overlay={%
            \draw[black,line width=3pt]%
            ([yshift=-1pt]frame.north west) --%
            ([yshift=-1pt]frame.north east);}%
        },%
    coltitle=black,fonttitle=\large\bf,%
    before=\par\medskip\noindent,%
    parbox=false,%
    boxsep=0pt,%
    left=0pt,%
    right=3mm,%
    top=4pt,%
    breakable,%
    pad at break*=0mm,%
    vfill before first,%
    overlay unbroken={%
        \draw[gray,line width=1pt]%
        ([yshift=-1pt]title.north east) --%
        ([xshift=-0.5pt,yshift=-1pt]title.north-|frame.east) --%
        ([xshift=-0.5pt]frame.south east)--(frame.south west);},%
    overlay first={%
        \draw[prb,line width=1pt]%
        ([yshift=-1pt]title.north east) --%
        ([xshift=-0.5pt,yshift=-1pt]title.north-|frame.east) --%
        ([xshift=-0.5pt]frame.south east);},%
    overlay middle={%
        \draw[prb,line width=1pt]%
        ([xshift=-0.5pt]frame.north east) --%
        ([xshift=-0.5pt]frame.south east);},%
    overlay last={%
        \draw[prb,line width=1pt]%
        ([xshift=-0.5pt]frame.north east) --%
        ([xshift=-0.5pt]frame.south east)--(frame.south west);}]%
    }{%
    \end{tcolorbox}%
    \stepcounter{pr@blem}%
}


%%%%%%%%%%%%%%%%%%%%%%%%%
% counselor comments %
%%%%%%%%%%%%%%%%%%%%%%%%%


\RequirePackage{tikz}
\usetikzlibrary{intersections,shapes,calc}
%once we get pdfTeX working in Circle Z, these ``better'' commenting macros will work
%\RequirePackage{tikzpagenodes}
%\newcounter{m@rks}
%\newcommand{\m@rktikz}[2]{%
%    \def\m@rk{\arabic{m@rks}}%
%    \def\b@ses{{"0.75ex","-2ex"}}%
%    \def\l@bels{{#1,#2}}%
%    \foreach \x in {0,1}{%
%    \pgfmathsetmacro\b@se{\b@ses[\x]}%
%    \pgfmathsetmacro\l@bel{\l@bels[\x]}%
%    \tikz[remember picture,%
%        overlay,%
%        baseline=\b@se]\coordinate (\m@rk-\l@bel) at (0,0);%
%    }%
%}%
%\newcommand{\bcom}[1][]{%
%    \m@rktikz{2}{3}%
%    \def\@rem{#1}%
%    }
%\newcommand{\fcom}{
%    \m@rktikz{7}{6}%
%    \begin{tikzpicture}[remember picture,overlay]%
%    \path[name path=b@x,draw]%
%    (current page text area.north west)%
%     rectangle (current page text area.south east);%
%    \def\p@ths{{"@a","@b","@c","@d"}}%
%    \foreach \i/\j/\k in {2/1/0,3/0/1,7/1/2,6/0/3}{%
%    \pgfmathsetmacro\p@th{\p@ths[\k]}%
%    \path[name path global=\p@th]%
%     (\m@rk-\i) --+ ({180*\j}:\textwidth);%
%    }%
%    \foreach \i/\j in {1/0,4/1,8/2,5/3}{%
%    \pgfmathsetmacro\p@th{\p@ths[\j]}%
%    \node (intersection-1) at (current page.north west) {};%a dirty hack
%    \path[name intersections={of={{\p@th} and b@x},by=\m@rk-\i}];%
%    }%
%    \filldraw[draw=pink!50!black,thick,fill=pink,fill opacity=0.15]%
%        (\m@rk-1) -- (\m@rk-2) --
%        (\m@rk-3) -- (\m@rk-4) --%
%        (\m@rk-5) -- (\m@rk-6) --%
%        (\m@rk-7) -- (\m@rk-8) -- cycle;%
%    \ifx\@rem\@empty%
%    \else%
%    \node[outer xsep=5pt] (cap) at (\m@rk-4) {};%
%    \node[rectangle callout,%
%        callout absolute pointer=(\m@rk-4),%
%        thick,
%        font=\small,
%        draw=purple!50!black,%
%        rounded corners=1pt,%
%        fill=purple!15,%
%        anchor=north west,%
%       align=left,%
%        text width=2.75in] (ccom) at (cap.north east) {\@rem};%
%    \node[font=\ttfamily\footnotesize,%
%        anchor=south east,%
%        purple!50!black,%
%        inner sep=1pt] at (ccom.north east)%
%        {counselor comment};%
%    \fi%
%    \end{tikzpicture}%
%    \stepcounter{m@rks}\ignorespaces%
%}

\RequirePackage{textpos}
\RequirePackage{xargs}   %xparse is not available

%usage: \bcom[<color>]{<comment>}[h offset][v offset]
\newcommandx*{\bcom}[4][1=red, 3=9.5, 4=-0.2]{%
    \hfuzz=155pt\color{#1}%
    \leavevmode\vadjust{%
    \begin{textblock}{2}(#3,#4)%
    \begin{tikzpicture}%
        \node[outer xsep=5pt] (anch) at (0,0) {};%
        \node[rectangle callout,%
        callout absolute pointer=(anch),%
        thick,%
        font=\small\color{black},%
        draw=#1!50!black,%
        rounded corners=1pt,%
        fill=#1!15,%
        anchor=north west,%
        align=left,%
        text width=2.75in] at (anch.north east) {#2};%
    \end{tikzpicture}\end{textblock}\ignorespaces\hfuzz=0pt}%
}

\newcommand{\ecom}{
    \color{black}%
    }

%usage: \begin{gcom} <general comments> \end{gcom}
\newtcolorbox{gcom}[1][Overall Comments]%
       {colbacktitle=purple!20!,%
        coltitle=black,%
        colframe=purple!50!black,%
        colback=purple!05,%
        arc=3pt,%
        title={\bfseries #1}}%

\endinput
