export const fetchHelper = async (url: string): Promise<Response | undefined> => {
  try {
    return await fetch(url);
  } catch (error) {
    console.log(error)
    return undefined;
  }
};