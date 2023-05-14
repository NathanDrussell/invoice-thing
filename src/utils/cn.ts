export const cn = (...args: any[]) => {
  return args.filter(Boolean).join(" ");
};
