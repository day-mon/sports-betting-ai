export const fetchHelper = async (url: string): Promise<Response | undefined> => {
  try {
    return await fetch(url);
  } catch (error) {
    return undefined;
  }
};
