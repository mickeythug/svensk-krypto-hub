-- Create table for storing meme image positions
CREATE TABLE public.meme_image_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id text NOT NULL,
  position_x numeric NOT NULL,
  position_y numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.meme_image_positions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own meme positions" 
ON public.meme_image_positions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meme positions" 
ON public.meme_image_positions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meme positions" 
ON public.meme_image_positions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meme positions" 
ON public.meme_image_positions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meme_positions_updated_at
BEFORE UPDATE ON public.meme_image_positions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();